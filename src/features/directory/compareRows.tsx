import type { ReactNode } from 'react';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate, gbp } from '@/shared/lib/format';
import { costSummary } from '@/shared/lib/portfolio';
import type { CostRecord, OutcomeMeasure, Project, Release } from '@/shared/types/domain';
import { gateSummary } from './directoryModel';

export type Focus = 'delivery' | 'releases' | 'cost' | 'outcomes';
export type CompareRow = { label: string; cell: (p: Project) => ReactNode; numeric?: boolean };
export type CompareData = { releases: Release[]; costs: CostRecord[]; outcomes: OutcomeMeasure[] };

const signed = (n: number) => `${n >= 0 ? '+' : ''}${gbp(n)}`;

/** Row definitions per focus. Outcomes are listed with their definitions, never compared as numbers. */
export function compareRows({ releases, costs, outcomes }: CompareData): Record<Focus, CompareRow[]> {
  const rel = (p: Project) => releases.filter((r) => r.projectId === p.id);
  const out = (p: Project) => outcomes.filter((o) => o.projectId === p.id);
  const cost = (p: Project) => costSummary(costs, [p.id]);
  return {
    delivery: [
      { label: 'Delivery position', cell: (p) => <ConditionChip condition={p.position.delivery} /> },
      { label: 'Current commitment', cell: (p) => p.commitment.label },
      { label: 'Original date', cell: (p) => formatDate(p.commitment.original), numeric: true },
      { label: 'Current date', cell: (p) => formatDate(p.commitment.current), numeric: true },
      { label: 'Actual', cell: (p) => (p.commitment.actual ? formatDate(p.commitment.actual) : 'Not yet'), numeric: true },
      { label: 'Stage', cell: (p) => <StatusChip tone="info" dot={false}>{p.stage}</StatusChip> },
      { label: 'Governance gates', cell: (p) => { const g = gateSummary(p.gates); return `${g.passed} of ${g.total} passed${g.next ? `; ${g.next.name} ${g.next.status}` : ''}`; } },
    ],
    releases: [
      { label: 'Release position', cell: (p) => <ConditionChip condition={p.position.releases} /> },
      { label: 'Releases recorded', cell: (p) => String(rel(p).length), numeric: true },
      { label: 'Available to the business', cell: (p) => rel(p).filter((r) => r.events.some((e) => e.kind === 'available')).map((r) => r.capability).join('; ') || 'None yet' },
      { label: 'Outstanding conditions', cell: (p) => rel(p).flatMap((r) => r.outstandingConditions).join('; ') || 'None' },
    ],
    cost: [
      { label: 'Cost position', cell: (p) => <ConditionChip condition={p.position.cost} /> },
      { label: 'Budget (FY26, GBP, direct)', cell: (p) => gbp(cost(p).budget), numeric: true },
      { label: 'Actual to date', cell: (p) => gbp(cost(p).actual), numeric: true },
      { label: 'Forecast', cell: (p) => gbp(cost(p).forecast), numeric: true },
      { label: 'Variance', cell: (p) => signed(cost(p).variance), numeric: true },
      { label: 'Shared allocation (excluded)', cell: (p) => { const c = cost(p); return c.sharedExcluded ? `${gbp(c.sharedExcluded)}, basis not agreed` : 'None'; }, numeric: true },
      { label: 'Funded by', cell: (p) => p.funding.map((f) => `${f.businessUnit} ${f.percent}%`).join('; ') },
    ],
    outcomes: [
      { label: 'Outcome position', cell: (p) => <ConditionChip condition={p.position.outcomes} /> },
      { label: 'Measured outcomes', cell: (p) => out(p).filter((o) => o.actual).map((o) => `${o.name}: ${o.actual} (${o.period})`).join('; ') || 'None measured' },
      { label: 'Forecast benefits', cell: (p) => out(p).filter((o) => !o.actual).map((o) => `${o.name}: ${o.forecast}, ${o.period}`).join('; ') || 'None defined' },
      { label: 'Definitions differ', cell: (p) => out(p).map((o) => o.definition).join(' / ') || 'No measure defined' },
    ],
  };
}
