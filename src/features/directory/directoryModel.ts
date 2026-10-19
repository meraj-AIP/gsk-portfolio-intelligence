import { CONDITION_SHORT } from '@/shared/lib/format';
import { DIMENSIONS, STAGES, type Condition, type Dimension, type GovernanceGate, type Project, type Stage } from '@/shared/types/domain';

// Same ordering the portfolio rules use: a breach outranks attention, and missing information outranks a plain report.
const ORDER: Condition[] = ['breached', 'attention', 'unknown', 'reported', 'met'];

/** The worst condition across a project's dimensions and the first dimension that sets it. */
export function worstOf(position: Record<Dimension, Condition>): { condition: Condition; dimension: Dimension } {
  for (const c of ORDER) {
    const d = DIMENSIONS.find((x) => position[x] === c);
    if (d) return { condition: c, dimension: d };
  }
  return { condition: 'met', dimension: 'delivery' };
}

export function worstAcross(projects: Project[]): Condition {
  return ORDER.find((c) => projects.some((p) => DIMENSIONS.some((d) => p.position[d] === c))) ?? 'unknown';
}

export const riskLabel = (p: Project): string => {
  const w = worstOf(p.position);
  return w.condition === 'met' ? 'All met' : `${CONDITION_SHORT[w.condition]}: ${w.dimension}`;
};

// Paused sits outside the lifecycle, so it has no position along it.
const LIFECYCLE: Stage[] = STAGES.filter((s) => s !== 'Paused');

/** Position of a stage along the agreed lifecycle, as a step count rather than a completion estimate. */
export function stageStep(stage: Stage): { step: number; of: number; percent: number } {
  const i = LIFECYCLE.indexOf(stage);
  const step = i + 1;
  return { step, of: LIFECYCLE.length, percent: step ? (step / LIFECYCLE.length) * 100 : 0 };
}

export function gateSummary(gates: GovernanceGate[]): { passed: number; total: number; next?: GovernanceGate; returned: number } {
  const next = gates.find((g) => g.status !== 'passed');
  return {
    passed: gates.filter((g) => g.status === 'passed').length,
    total: gates.length,
    returned: gates.filter((g) => g.status === 'returned').length,
    ...(next ? { next } : {}),
  };
}

export const countBy = <T,>(items: T[], key: (t: T) => string): Map<string, number> => {
  const m = new Map<string, number>();
  for (const it of items) m.set(key(it), (m.get(key(it)) ?? 0) + 1);
  return m;
};
