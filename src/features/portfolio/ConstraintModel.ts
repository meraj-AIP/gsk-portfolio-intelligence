import type { SharedConstraint } from '@/shared/lib/constraints';
import type { Commitment, NodeKind, Project } from '@/shared/types/domain';

export const KIND_SINGULAR: Record<NodeKind, string> = {
  programme: 'Programme', project: 'Project', dataset: 'Dataset', model: 'Model', team: 'Team', service: 'Shared service', outcome: 'Outcome',
};

export type ScopedConstraint = SharedConstraint & { inScopeProjectIds: string[]; inScopeProgrammeIds: string[] };

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Counts only the work inside the selected portfolio, so the list, the lead sentence and the trace agree. */
export function scopeConstraints(list: SharedConstraint[], projects: Project[], scopeIds: string[]): ScopedConstraint[] {
  return list.map((c) => {
    const inScopeProjectIds = c.projectIds.filter((id) => scopeIds.includes(id));
    const inScopeProgrammeIds = [...new Set(projects.filter((p) => inScopeProjectIds.includes(p.id)).map((p) => p.programmeId))];
    return { ...c, inScopeProjectIds, inScopeProgrammeIds };
  });
}

/** The constraint holding the most work. The list arrives worst first and the sort is stable, so ties go to the worse one. */
export function mostShared(list: ScopedConstraint[]): ScopedConstraint | undefined {
  return [...list].sort((a, b) => b.inScopeProjectIds.length - a.inScopeProjectIds.length)[0];
}

export function leadSentence(list: ScopedConstraint[]): string {
  const top = mostShared(list);
  if (!top) return 'No input, team, model or service is shared by more than one project in this portfolio, and none is causing a breach.';
  const worst = top.worst === 'breached' ? ' At least one of its dependencies is breached.' : top.worst === 'attention' ? ' At least one of its dependencies needs attention.' : '';
  return `${top.node.label} is the most shared constraint. It holds ${plural(top.inScopeProjectIds.length, 'project')} across ${plural(top.inScopeProgrammeIds.length, 'programme')}.${worst} ${plural(list.length, 'shared constraint')} in this portfolio in total.`;
}

const days = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

/** Calculated from the two recorded dates; says nothing about why the date moved. */
export function commitmentMove(c: Commitment): string {
  const d = days(c.baselineDate, c.currentDate);
  if (d === 0) return 'on baseline';
  return d > 0 ? `${plural(d, 'day')} later than baseline` : `${plural(-d, 'day')} earlier than baseline`;
}
