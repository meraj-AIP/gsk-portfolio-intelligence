import type { Condition, Dimension, Finding, Project } from '@/shared/types/domain';
import { DIMENSIONS } from '@/shared/types/domain';

export const DIM_LABEL: Record<Dimension, string> = { delivery: 'Delivery', releases: 'Releases', dependencies: 'Dependencies', cost: 'Cost', outcomes: 'Outcomes' };

export const DIM_HELP: Record<Dimension, string> = {
  delivery: 'Position against current commitments and movement since the previous review',
  releases: 'Capabilities delivered, delayed or awaiting availability',
  dependencies: 'Constraints affecting connected work. Select the header to open the constraints view',
  cost: 'Actual and forecast position against the applicable budget',
  outcomes: 'Adoption and benefit evidence against stated expectations',
};

export const DIM_CATEGORY: Record<Dimension, Finding['category'][]> = {
  delivery: ['delayed commitment', 'decision needed', 'missing information'],
  releases: ['release issue'],
  dependencies: ['decision needed', 'governance'],
  cost: ['cost concern'],
  outcomes: ['missing information'],
};

const SEVERITY: Record<Condition, number> = { breached: 4, attention: 3, unknown: 2, reported: 1, met: 0 };

/** The single worst condition across a programme's projects and dimensions, never an average. */
export function worstCondition(projects: Project[]): Condition {
  return projects.flatMap((p) => DIMENSIONS.map((d) => p.position[d])).reduce<Condition>((w, c) => (SEVERITY[c] > SEVERITY[w] ? c : w), 'met');
}

/** One plain line saying why a programme sits where it does, naming the dimensions and projects behind the worst condition. */
export function programmeReason(projects: Project[]): string {
  const worst = worstCondition(projects);
  if (SEVERITY[worst] <= SEVERITY.reported) return 'All projects are met or reported on every dimension.';
  const hits = DIMENSIONS.flatMap((d) => projects.filter((p) => p.position[d] === worst).map((p) => ({ d, p })));
  const word = worst === 'unknown' ? 'has insufficient information' : worst === 'breached' ? 'breached' : 'needs attention';
  const first = hits[0];
  if (!first) return '';
  const rest = hits.length - 1;
  return `${DIM_LABEL[first.d]} ${word} on ${first.p.name}${rest ? ` and ${rest} other position${rest === 1 ? '' : 's'}` : ''}.`;
}
