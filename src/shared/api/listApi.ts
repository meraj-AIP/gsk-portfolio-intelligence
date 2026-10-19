import type { Action, Commitment, Decision, Dependency, Finding, Page, Programme, Project } from '@/shared/types/domain';
import type { AuditEntry, Clarification } from '@/shared/types/workflow';
import { canSeeSource } from '@/shared/lib/permissions';
import { getActor } from './session';
import { captureContent, diffPositions, type PositionChange } from './snapshots';
import { respond, store, today } from './store';

export type ListParams = { q?: string; page: number; pageSize: number; owner?: string; status?: string; scope?: string };

function paginate<T>(rows: T[], p: ListParams): Promise<Page<T>> {
  const start = p.page * p.pageSize;
  return respond({ items: rows.slice(start, start + p.pageSize), total: rows.length, page: p.page, pageSize: p.pageSize });
}

const has = (q: string | undefined, ...fields: (string | undefined)[]) => !q || fields.join(' ').toLowerCase().includes(q.toLowerCase());

/** Project ids inside a portfolio scope: "All programmes" or a programme id. */
export function projectIdsInScope(scope: string | undefined): string[] {
  return store.projects.filter((p) => !scope || scope === 'All programmes' || p.programmeId === scope).map((p) => p.id);
}

function touchesScope(ids: string[], scope?: string): boolean {
  if (!scope || scope === 'All programmes') return true;
  const inScope = projectIdsInScope(scope);
  const commitments = store.commitments.filter((c) => inScope.includes(c.projectId)).map((c) => c.id);
  return ids.some((id) => id === scope || inScope.includes(id) || commitments.includes(id));
}

/** awaiting: a response was requested and none exists for the current version, since the evidence moved. */
export function listFindings(p: ListParams & { category?: string; statementType?: string; awaiting?: boolean }): Promise<Page<Finding>> {
  const rows = store.findings.filter((f) => has(p.q, f.title, f.significance, f.id) && (!p.category || f.category === p.category)
    && (!p.awaiting || (Boolean(f.requestedOwner) && f.responses.every((r) => r.findingVersion !== f.version)))
    && (!p.statementType || f.statementType === p.statementType) && (!p.owner || f.requestedOwner === p.owner) && touchesScope(f.affectedIds, p.scope));
  return paginate(rows, p);
}

export function listActions(p: ListParams): Promise<Page<Action>> {
  const rows = store.actions.filter((a) => has(p.q, a.title, a.owner, a.id) && (!p.owner || a.owner === p.owner) && (!p.status || a.status === p.status)
    && (!a.findingId || touchesScope(store.findings.find((f) => f.id === a.findingId)?.affectedIds ?? [], p.scope)))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return paginate(rows, p);
}

export function listDecisions(p: ListParams): Promise<Page<Decision>> {
  const rows = store.decisions.filter((d) => has(p.q, d.question, d.conclusion, d.decisionMaker)
    && (!d.findingId || touchesScope(store.findings.find((f) => f.id === d.findingId)?.affectedIds ?? [], p.scope)))
    .sort((a, b) => b.date.localeCompare(a.date));
  return paginate(rows, p);
}

export function listDependencies(p: ListParams & { type?: string; requiredBefore?: string }): Promise<Page<Dependency>> {
  const rows = store.dependencies.filter((d) => has(p.q, d.description, d.owner, d.id) && (!p.type || d.type === p.type) && (!p.owner || d.owner === p.owner)
    && (!p.requiredBefore || d.requiredDate <= p.requiredBefore)
    && touchesScope([d.fromId, d.toId], p.scope));
  return paginate(rows, p);
}

export function listClarifications(p: ListParams): Promise<Page<Clarification>> {
  const rows = store.clarifications.filter((c) => (!p.owner || c.owner === p.owner) && (!p.status || c.status === p.status));
  return paginate([...rows].reverse(), p);
}

export function listAudit(p: ListParams & { kind?: string; targetId?: string }): Promise<Page<AuditEntry>> {
  const rows = store.audit.filter((a) => has(p.q, a.summary, a.user, a.targetId) && (!p.kind || a.kind === p.kind) && (!p.targetId || a.targetId === p.targetId));
  return paginate([...rows].reverse(), p);
}

export type ProgrammeRow = Programme & { projectCount: number; keyCommitment?: Commitment; materialFindingId?: string; freshness: Project['freshness'] };

/** Directory programme rows, searchable by objective as well as name, sponsor and lead (FR-04). */
export function listProgrammeRows(q: string, scope?: string): Promise<ProgrammeRow[]> {
  const rows = store.programmes.filter((pg) => (!scope || scope === 'All programmes' || pg.id === scope) && has(q, pg.name, pg.objective, pg.sponsor, pg.lead, pg.businessArea))
    .map((pg) => {
      const projects = store.projects.filter((p) => p.programmeId === pg.id);
      const ids = projects.map((p) => p.id);
      const upcoming = store.commitments.filter((c) => ids.includes(c.projectId) && !c.actualDate).sort((a, b) => a.currentDate.localeCompare(b.currentDate));
      const worstFresh = projects.some((p) => p.freshness === 'missing') ? 'missing' : projects.some((p) => p.freshness === 'stale') ? 'stale' : 'current';
      const material = store.findings.find((f) => f.affectedIds.some((id) => ids.includes(id)) && f.persistent) ?? store.findings.find((f) => f.affectedIds.some((id) => ids.includes(id)));
      return { ...pg, projectCount: projects.length, freshness: worstFresh as Project['freshness'], ...(upcoming[0] ? { keyCommitment: upcoming[0] } : {}), ...(material ? { materialFindingId: material.id } : {}) };
    });
  return respond(rows);
}

/** The open review is computed live; closed ones return what was frozen. */
export function getSnapshotContent(id: string) {
  const snap = store.snapshots.find((s) => s.id === id);
  if (!snap) return respond(null);
  return respond({ snapshot: snap, content: snap.content ?? captureContent(store, `${today} live`, 'Live') });
}

export type SnapshotComparison = { fromId: string; toId: string; changes: PositionChange[]; newFindingIds: string[]; changedFindingIds: string[] };

export function compareSnapshots(fromId: string, toId: string): Promise<SnapshotComparison | null> {
  const from = store.snapshots.find((s) => s.id === fromId);
  const to = store.snapshots.find((s) => s.id === toId);
  if (!from || !to) return respond(null);
  const a = from.content ?? captureContent(store, today, 'Live');
  const b = to.content ?? captureContent(store, today, 'Live');
  const before = new Map(a.findings.map((f) => [f.id, f]));
  return respond({
    fromId, toId, changes: diffPositions(a, b, store.projects),
    newFindingIds: b.findings.filter((f) => !before.has(f.id)).map((f) => f.id),
    changedFindingIds: b.findings.filter((f) => before.has(f.id) && before.get(f.id)!.currentPosition !== f.currentPosition).map((f) => f.id),
  });
}

export const getClarifications = () => respond(store.clarifications);
export const getInvestigations = () => respond(store.investigations);
export const getTechnicalIssues = () => respond(store.technicalIssues);
export const getResourceConstraints = () => respond(store.resourceConstraints);
export const getCapabilities = () => respond(store.capabilities);

/** Data owners receive only their own sources (row-level filtering stands in for the context layer's). */
export const getVisibleSources = () => respond(store.sources.filter((s) => canSeeSource(getActor(), s.id)));
