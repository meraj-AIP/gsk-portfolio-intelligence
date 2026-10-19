import type { Action, Condition, CostRecord, Dimension, Finding, OutcomeMeasure, Project } from '@/shared/types/domain';
import { DIMENSIONS } from '@/shared/types/domain';

const SEVERITY: Record<Condition, number> = { breached: 4, attention: 3, unknown: 2, reported: 1, met: 0 };

/** Programme position per dimension: the worst contributing project condition, never an average. */
export function programmePosition(projects: Project[]): Record<Dimension, Condition> {
  const result = {} as Record<Dimension, Condition>;
  for (const d of DIMENSIONS) {
    result[d] = projects.reduce<Condition>((worst, p) => (SEVERITY[p.position[d]] > SEVERITY[worst] ? p.position[d] : worst), 'met');
  }
  return result;
}

export function contributingProjects(projects: Project[], dimension: Dimension, condition: Condition): Project[] {
  return projects.filter((p) => p.position[dimension] === condition);
}

export type CostSummary = { budget: number; actual: number; forecast: number; variance: number; sharedExcluded: number; coverage: number; of: number };

/** Direct costs only. Shared allocations are reported separately until an allocation basis exists (DEF-06). */
export function costSummary(records: CostRecord[], projectIds: string[]): CostSummary {
  const inScope = records.filter((r) => projectIds.includes(r.projectId));
  const direct = inScope.filter((r) => r.allocationBasis === 'Direct');
  const sum = (kind: CostRecord['kind']) => direct.filter((r) => r.kind === kind).reduce((a, r) => a + r.amount, 0);
  const budget = sum('budget');
  const forecast = sum('forecast');
  const sharedExcluded = inScope.filter((r) => r.allocationBasis !== 'Direct').reduce((a, r) => a + r.amount, 0);
  const covered = new Set(direct.map((r) => r.projectId)).size;
  return { budget, actual: sum('actual'), forecast, variance: forecast - budget, sharedExcluded, coverage: covered, of: projectIds.length };
}

export function outcomeSplit(measures: OutcomeMeasure[], projectIds: string[]) {
  const inScope = measures.filter((m) => projectIds.includes(m.projectId));
  return {
    forecast: inScope.filter((m) => m.kind === 'forecast benefit'),
    measured: inScope.filter((m) => m.kind === 'measured outcome'),
    capacity: inScope.filter((m) => m.kind === 'released capacity'),
    cash: inScope.filter((m) => m.kind === 'cash saving'),
  };
}

export function findingsFor(findings: Finding[], ids: string[]): Finding[] {
  return findings.filter((f) => f.affectedIds.some((id) => ids.includes(id)));
}

export function isConfirmed(f: Finding): boolean {
  return f.responses.some((r) => r.findingVersion === f.version && r.action === 'confirmed');
}

export const CATEGORY_CONDITION: Record<Finding['category'], Condition> = {
  'decision needed': 'attention',
  'delayed commitment': 'breached',
  'release issue': 'attention',
  'cost concern': 'breached',
  'missing information': 'unknown',
  governance: 'attention',
};

export function actionAge(action: Action, today: string): { overdueDays: number; persistent: boolean } {
  const overdueDays = Math.round((new Date(today).getTime() - new Date(action.dueDate).getTime()) / 86_400_000);
  return { overdueDays, persistent: action.createdWeek < '2026-W41' };
}

export function scopeProjectIds(projects: Project[], portfolio: string): string[] {
  return projects.filter((p) => portfolio === 'All programmes' || p.programmeId === portfolio).map((p) => p.id);
}
