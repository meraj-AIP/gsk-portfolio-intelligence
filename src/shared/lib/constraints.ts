import type { Commitment, Condition, Dependency, GraphNode, Release } from '@/shared/types/domain';
import type { JourneyData } from './journey';

const SEVERITY: Record<Condition, number> = { breached: 4, attention: 3, unknown: 2, reported: 1, met: 0 };

export type SharedConstraint = {
  node: GraphNode;
  worst: Condition;
  dependencyIds: string[];
  projectIds: string[];
  programmeIds: string[];
  findingIds: string[];
};

/**
 * Inputs, teams, models and services that more than one project relies on, or any one that is already causing a breach
 * or needing attention. Worst first, then by reach.
 */
export function sharedConstraints(s: JourneyData): SharedConstraint[] {
  const targets = s.graphNodes.filter((n) => n.kind !== 'project' && n.kind !== 'programme' && n.kind !== 'outcome');
  return targets.map((node) => {
    const deps = s.dependencies.filter((d) => d.toId === node.id);
    const projectIds = [...new Set(deps.map((d) => d.fromId).filter((id) => id.startsWith('P-')))];
    const programmeIds = [...new Set(s.projects.filter((p) => projectIds.includes(p.id)).map((p) => p.programmeId))];
    const worst = deps.reduce<Condition>((w, d) => (SEVERITY[d.position] > SEVERITY[w] ? d.position : w), 'met');
    const findingIds = s.findings.filter((f) => f.affectedIds.some((id) => deps.some((d) => d.id === id))).map((f) => f.id);
    return { node, worst, dependencyIds: deps.map((d) => d.id), projectIds, programmeIds, findingIds };
  })
    .filter((c) => c.projectIds.length > 1 || SEVERITY[c.worst] >= SEVERITY.attention)
    .sort((a, b) => SEVERITY[b.worst] - SEVERITY[a.worst] || b.projectIds.length - a.projectIds.length);
}

export type TraceRow = {
  dependency: Dependency;
  programmeId: string;
  programmeName: string;
  projectId: string;
  projectName: string;
  projectOwner: string;
  commitments: Commitment[];
  /** Recorded effect plus what the owner reported. Never mixed with the inferred column. */
  confirmedImpact: string;
  ownerReported: string;
  inferredExposure: string;
};

/** Every piece of work held by one constraint, with confirmed impact and inferred exposure kept in separate fields. */
export function constraintTrace(nodeId: string, s: JourneyData): TraceRow[] {
  return s.dependencies.filter((d) => d.toId === nodeId).flatMap((d) => {
    const p = s.projects.find((x) => x.id === d.fromId);
    if (!p) return [];
    const pg = s.programmes.find((x) => x.id === p.programmeId);
    return [{
      dependency: d, programmeId: p.programmeId, programmeName: pg?.name ?? p.programmeId, projectId: p.id, projectName: p.name, projectOwner: p.owner,
      commitments: s.commitments.filter((c) => d.affectedCommitmentIds.includes(c.id)),
      confirmedImpact: d.actualImpact, ownerReported: d.ownerReportedImpact, inferredExposure: d.aiInferredExposure,
    }];
  }).sort((a, b) => a.programmeName.localeCompare(b.programmeName) || SEVERITY[b.dependency.position] - SEVERITY[a.dependency.position]);
}

export type ReleaseSummary = {
  release: Release;
  plannedFirst?: string;
  plannedLatest?: string;
  availableOn?: string;
  slipDays?: number;
  audience: string;
  adoption: string;
  conditions: string[];
  withdrawn: boolean;
};

const days = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

/** The five things a stakeholder asks of a release: what, for whom, planned against actual, adoption, and what is still open. */
export function releaseSummary(r: Release): ReleaseSummary {
  const planned = r.events.filter((e) => e.kind === 'planned').map((e) => e.date).sort();
  const available = r.events.filter((e) => e.kind === 'available' || e.kind === 'expanded').map((e) => e.date).sort()[0];
  const base = planned[0];
  return {
    release: r,
    ...(base ? { plannedFirst: base } : {}),
    ...(planned.at(-1) ? { plannedLatest: planned.at(-1)! } : {}),
    ...(available ? { availableOn: available } : {}),
    ...(base && available ? { slipDays: days(base, available) } : {}),
    audience: r.enabledTeams.length ? r.enabledTeams.join(', ') : 'No audience enabled yet',
    adoption: r.adoption ? `${r.adoption.activeUsers} active in ${r.adoption.period}${r.adoption.early ? ' (early evidence)' : ''}. ${r.adoption.note}` : 'No adoption observed yet',
    conditions: r.outstandingConditions,
    withdrawn: r.events.some((e) => e.kind === 'withdrawn'),
  };
}
