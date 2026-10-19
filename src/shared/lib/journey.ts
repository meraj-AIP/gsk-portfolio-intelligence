import type { Action, Commitment, Decision, Finding, OutcomeMeasure, Project, Snapshot } from '@/shared/types/domain';
import type { Store } from '@/shared/api/store';
import { costSummary, type CostSummary } from './portfolio';

export type JourneyData = Pick<Store, 'programmes' | 'projects' | 'commitments' | 'dependencies' | 'findings' | 'actions' | 'decisions' | 'outcomeMeasures' | 'costRecords' | 'snapshots' | 'graphNodes' | 'releases'>;

export const LIFECYCLE = ['open', 'awaiting response', 'response recorded', 'in resolution', 'resolved'] as const;
export type Lifecycle = (typeof LIFECYCLE)[number];

/** Where a finding stands between "raised" and "resolved". Verified completion of every linked action is the only route to resolved. */
export function findingLifecycle(f: Finding, actions: Action[], decisions: Decision[]): { stage: Lifecycle; detail: string } {
  const linked = actions.filter((a) => a.findingId === f.id);
  const decided = decisions.filter((d) => d.findingId === f.id);
  const current = f.responses.filter((r) => r.findingVersion === f.version);
  if (linked.length && linked.every((a) => a.status === 'verified complete')) return { stage: 'resolved', detail: `All ${linked.length} linked action${linked.length === 1 ? '' : 's'} verified complete.` };
  if (linked.length || decided.length) {
    const open = linked.filter((a) => a.status !== 'verified complete').length;
    return { stage: 'in resolution', detail: `${decided.length} decision${decided.length === 1 ? '' : 's'} recorded, ${open} action${open === 1 ? '' : 's'} not yet verified.` };
  }
  if (current.length) return { stage: 'response recorded', detail: `${current.at(-1)!.reviewer} ${current.at(-1)!.action} against version ${f.version}.` };
  if (f.requestedOwner) return { stage: 'awaiting response', detail: `Requested from ${f.requestedOwner}${f.dueDate ? `, due ${f.dueDate}` : ''}.` };
  return { stage: 'open', detail: 'No owner response requested yet.' };
}

export type ImpactRow = {
  programmeId: string;
  programmeName: string;
  projectId: string;
  projectName: string;
  owner: string;
  commitments: Commitment[];
  note: string;
  evidenceId?: string;
};

export type Impact = { confirmed: ImpactRow[]; inferred: ImpactRow[] };

function row(s: JourneyData, project: Project, commitments: Commitment[], note: string, evidenceId?: string): ImpactRow {
  const pg = s.programmes.find((p) => p.id === project.programmeId);
  return {
    programmeId: project.programmeId, programmeName: pg?.name ?? project.programmeId, projectId: project.id, projectName: project.name, owner: project.owner,
    commitments, note, ...(evidenceId ? { evidenceId } : {}),
  };
}

/**
 * What a finding touches, split by basis. Reported facts and calculations are confirmed impact; AI interpretations and a
 * dependency's inferred exposure stay separate so a leader never mistakes one for the other.
 */
export function findingImpact(f: Finding, s: JourneyData): Impact {
  const confirmed: ImpactRow[] = [];
  const inferred: ImpactRow[] = [];
  const direct = f.statementType === 'AI interpretation' ? inferred : confirmed;
  const commitmentsOf = (pid: string) => s.commitments.filter((c) => c.projectId === pid && f.affectedIds.includes(c.id));
  const projectIds = new Set([
    ...f.affectedIds.filter((id) => id.startsWith('P-')),
    ...s.commitments.filter((c) => f.affectedIds.includes(c.id)).map((c) => c.projectId),
  ]);
  projectIds.forEach((pid) => {
    const p = s.projects.find((x) => x.id === pid);
    if (p) direct.push(row(s, p, commitmentsOf(pid), f.currentPosition, f.evidenceIds[0]));
  });
  s.dependencies.filter((d) => f.affectedIds.includes(d.id)).forEach((d) => {
    const p = s.projects.find((x) => x.id === d.fromId);
    if (!p) return;
    const cs = s.commitments.filter((c) => d.affectedCommitmentIds.includes(c.id));
    if (!/^none/i.test(d.actualImpact)) confirmed.push(row(s, p, cs, d.actualImpact, d.evidenceId));
    else inferred.push(row(s, p, cs, d.aiInferredExposure, d.evidenceId));
  });
  const dedupe = (rows: ImpactRow[]) => rows.filter((r, i) => rows.findIndex((x) => x.projectId === r.projectId && x.note === r.note) === i);
  const conf = dedupe(confirmed);
  return { confirmed: conf, inferred: dedupe(inferred).filter((r) => !conf.some((c) => c.projectId === r.projectId && c.note === r.note)) };
}

export type Implication = {
  summary: string;
  programmes: string[];
  commitmentsAtRisk: Commitment[];
  forecastOutcomes: OutcomeMeasure[];
  measuredOutcomes: OutcomeMeasure[];
  cost: CostSummary;
};

const gbpK = (n: number) => `£${Math.round(n / 1000)}k`;

/** Why it matters, in business terms: the commitments, outcomes and spend that sit behind the affected work. */
export function findingImplication(f: Finding, s: JourneyData, impact: Impact = findingImpact(f, s)): Implication {
  const rows = [...impact.confirmed, ...impact.inferred];
  const projectIds = [...new Set(rows.map((r) => r.projectId))];
  const programmes = [...new Set(rows.map((r) => r.programmeName))];
  const commitmentsAtRisk = [...new Map(rows.flatMap((r) => r.commitments).filter((c) => !c.actualDate).map((c) => [c.id, c])).values()];
  const outcomes = s.outcomeMeasures.filter((o) => projectIds.includes(o.projectId));
  const measuredOutcomes = outcomes.filter((o) => o.actual);
  const forecastOutcomes = outcomes.filter((o) => !o.actual);
  const cost = costSummary(s.costRecords, projectIds);
  const parts = [
    `${projectIds.length} project${projectIds.length === 1 ? '' : 's'} in ${programmes.length} programme${programmes.length === 1 ? '' : 's'}`,
    commitmentsAtRisk.length ? `${commitmentsAtRisk.length} open commitment${commitmentsAtRisk.length === 1 ? '' : 's'}` : 'no open commitment',
    forecastOutcomes.length ? `${forecastOutcomes.length} benefit${forecastOutcomes.length === 1 ? '' : 's'} still forecast` : '',
    cost.budget ? `${gbpK(cost.budget)} of direct budget` : '',
  ].filter(Boolean);
  return { summary: `Touches ${parts.join(', ')}.`, programmes, commitmentsAtRisk, forecastOutcomes, measuredOutcomes, cost };
}

export type TrailPoint = { snapshotId: string; week: string; present: boolean; position?: string; changed: boolean; status: Snapshot['status'] };

/** The finding's position in each review, oldest first, so a carried-forward item shows how it got here. */
export function findingTrail(f: Finding, snapshots: Snapshot[]): TrailPoint[] {
  let previous: string | undefined;
  return [...snapshots].sort((a, b) => a.date.localeCompare(b.date)).map((snap) => {
    const frozen = snap.content?.findings.find((x) => x.id === f.id);
    const live = snap.status === 'open' && weekNo(f.firstSeenWeek) <= weekNo(snap.week) ? f.currentPosition : undefined;
    const position = frozen?.currentPosition ?? live;
    const point: TrailPoint = { snapshotId: snap.id, week: snap.week, present: position !== undefined, changed: position !== undefined && previous !== undefined && position !== previous, status: snap.status, ...(position ? { position } : {}) };
    if (position) previous = position;
    return point;
  });
}

export const weekNo = (week: string) => Number(week.split('-W')[1] ?? 0);
