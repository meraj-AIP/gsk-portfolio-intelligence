import type { Capability } from '@/shared/lib/permissions';
import { canSeeSource } from '@/shared/lib/permissions';
import type { CostRecord, Finding, Release, Source, SourceIssue } from '@/shared/types/domain';
import type { InvestigationRecord, User } from '@/shared/types/workflow';
import { audit, authorise } from './audit';
import { fail, nextId, respond, store, today } from './store';

function sourceFor(capability: Capability, sourceId: string): { user: User; source: Source } | { error: string } {
  const auth = authorise(capability);
  if ('error' in auth) return auth;
  const source = store.sources.find((s) => s.id === sourceId);
  if (!source) return { error: 'Source not found.' };
  if (!canSeeSource(auth.user, sourceId)) return { error: 'This source is outside your scope.' };
  return { user: auth.user, source };
}

export function retryIngestion(sourceId: string): Promise<boolean> {
  const r = sourceFor('retry ingestion', sourceId);
  if ('error' in r) return fail(r.error);
  r.source.connectionHealth = 'healthy';
  r.source.lastRefresh = `${today} 15:40`;
  r.source.issues.filter((i) => i.kind === 'failure' || i.description.startsWith('Nightly sync failed')).forEach((i) => {
    i.status = 'resolved';
    i.resolution = { decision: 'Ingestion retried successfully.', by: r.user.name, date: today };
  });
  audit(r.user, { kind: 'ingestion retried', targetId: sourceId, summary: `Retried ${r.source.name}` });
  return respond(true, 900);
}

export type IssueDecision = { sourceId: string; issueId: string; decision: string; type: 'mapping' | 'reconciliation' };

/**
 * Records how an issue was resolved, as a decision on the issue rather than edited text. A reconciliation names
 * which source's value stands; it never copies a newer value over an authoritative one.
 */
export function resolveSourceIssue(input: IssueDecision): Promise<SourceIssue> {
  const r = sourceFor(input.type === 'mapping' ? 'confirm mapping' : 'record reconciliation', input.sourceId);
  if ('error' in r) return fail(r.error);
  const issue = r.source.issues.find((i) => i.id === input.issueId);
  if (!issue) return fail('Issue not found.');
  if (!input.decision.trim()) return fail('Record the decision.');
  issue.status = 'resolved';
  issue.resolution = { decision: input.decision.trim(), by: r.user.name, date: today };
  audit(r.user, { kind: input.type === 'mapping' ? 'mapping confirmed' : 'reconciliation decision', targetId: issue.id, summary: input.decision, inputs: { ...input } });
  return respond(issue);
}

export function requestCorrection(sourceId: string, issueId: string, note: string): Promise<SourceIssue> {
  const r = sourceFor('request correction', sourceId);
  if ('error' in r) return fail(r.error);
  const issue = r.source.issues.find((i) => i.id === issueId);
  if (!issue) return fail('Issue not found.');
  issue.status = 'correction requested';
  audit(r.user, { kind: 'correction requested', targetId: issue.id, summary: note, inputs: { sourceId, issueId, note } });
  return respond(issue);
}

/** Anyone can flag an inconsistency; it lands as an open issue on the source the evidence came from. */
export function flagInconsistency(evidenceId: string, note: string): Promise<SourceIssue> {
  const auth = authorise();
  if ('error' in auth) return fail(auth.error);
  const ev = store.evidence.find((e) => e.id === evidenceId);
  if (!ev) return fail('Evidence not found.');
  if (!note.trim()) return fail('Describe the inconsistency.');
  const key = ev.source.toLowerCase();
  const source = store.sources.find((s) => key.includes(s.name.split(' (')[0]!.toLowerCase())) ?? store.sources.find((s) => s.id === 'SRC-01')!;
  const issue: SourceIssue = {
    id: nextId('SI', store.sources.flatMap((s) => s.issues)), kind: 'flag', description: `Flagged on ${ev.id}: ${note.trim()}`, affectedRecords: [ev.id], raised: today,
    reconciliationOwner: source.owner, downstream: store.findings.filter((f) => f.evidenceIds.includes(ev.id)).map((f) => f.id), status: 'open',
  };
  source.issues.push(issue);
  source.contentQuality = source.contentQuality === 'good' ? 'gaps' : source.contentQuality;
  audit(auth.user, { kind: 'inconsistency flagged', targetId: ev.id, summary: note, evidenceVersion: ev.version, inputs: { evidenceId, note, sourceId: source.id } });
  return respond(issue);
}

export function recordReleaseCondition(releaseId: string, condition: string, status: 'open' | 'met'): Promise<Release> {
  const auth = authorise('record release condition');
  if ('error' in auth) return fail(auth.error);
  const rel = store.releases.find((x) => x.id === releaseId);
  if (!rel) return fail('Release not found.');
  if (!condition.trim()) return fail('Describe the condition.');
  rel.conditionLog = [...(rel.conditionLog ?? []), { condition: condition.trim(), recordedBy: auth.user.name, date: today, status }];
  rel.outstandingConditions = status === 'open'
    ? [...new Set([...rel.outstandingConditions, condition.trim()])]
    : rel.outstandingConditions.filter((c) => c !== condition.trim());
  audit(auth.user, { kind: 'release condition', targetId: rel.id, summary: `${status === 'open' ? 'Added' : 'Met'}: ${condition}`, inputs: { condition, status } });
  return respond(rel);
}

export function confirmAllocationBasis(costRecordId: string, basis: string): Promise<CostRecord> {
  const auth = authorise('confirm allocation');
  if ('error' in auth) return fail(auth.error);
  const k = store.costRecords.find((x) => x.id === costRecordId);
  if (!k) return fail('Cost record not found.');
  if (!basis.trim()) return fail('State the allocation basis.');
  k.allocationBasis = basis.trim();
  k.allocationConfirmed = { by: auth.user.name, date: today };
  audit(auth.user, { kind: 'allocation confirmed', targetId: k.id, summary: basis, inputs: { costRecordId, basis } });
  return respond(k);
}

export function reconcileCostRecord(costRecordId: string, note: string): Promise<CostRecord> {
  const auth = authorise('reconcile cost');
  if ('error' in auth) return fail(auth.error);
  const k = store.costRecords.find((x) => x.id === costRecordId);
  if (!k) return fail('Cost record not found.');
  k.reconciliation = { by: auth.user.name, date: today, note: note.trim() };
  audit(auth.user, { kind: 'cost reconciled', targetId: k.id, summary: note, inputs: { costRecordId, note } });
  return respond(k);
}

/** Every run is kept with who asked, the scope, inputs and outcome (NFR-03, NFR-04). */
export function saveInvestigationRun(run: Omit<InvestigationRecord, 'id' | 'requestedBy' | 'role'>): Promise<InvestigationRecord> {
  const auth = authorise();
  if ('error' in auth) return fail(auth.error);
  const rec: InvestigationRecord = { ...run, id: nextId('INV', store.investigations), requestedBy: auth.user.name, role: auth.user.role };
  store.investigations.push(rec);
  audit(auth.user, { kind: 'investigation run', targetId: rec.id, summary: `${rec.state}: ${rec.question}`, inputs: { question: rec.question, scope: rec.contextIds.join(', '), period: rec.period } });
  return respond(rec, 60);
}

/** Sends a result to an owner as an AI interpretation finding they must respond to. It is never presented as fact. */
export function routeInvestigationToOwner(investigationId: string, owner: string, dueDate: string): Promise<Finding> {
  const auth = authorise('request response');
  if ('error' in auth) return fail(auth.error);
  const rec = store.investigations.find((x) => x.id === investigationId);
  if (!rec || rec.state !== 'completed') return fail('Only a completed investigation can be routed.');
  const finding: Finding = {
    id: nextId('F', store.findings), title: rec.question, category: 'decision needed', statementType: 'AI interpretation', affectedIds: rec.contextIds,
    previousPosition: 'Not raised', currentPosition: rec.answer ?? '', significance: 'Raised from an investigation. Interpretation only until the owner responds.',
    evidenceIds: rec.evidenceIds, unknowns: rec.uncertainties.join(' ') || 'None stated.', version: 1, firstSeenWeek: store.snapshots.find((s) => s.status === 'open')?.week ?? '2026-W41',
    persistent: false, responses: [], requestedOwner: owner, dueDate, ...(rec.method ? { calculation: { method: rec.method, inputs: rec.evidenceIds } } : {}),
  };
  store.findings.push(finding);
  rec.routedTo = owner;
  rec.findingId = finding.id;
  audit(auth.user, { kind: 'investigation routed', targetId: rec.id, summary: `Routed to ${owner} as ${finding.id}`, inputs: { owner, dueDate } });
  return respond(finding);
}
