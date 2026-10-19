import { describe, expect, it } from 'vitest';
import { store } from '@/shared/api/store';
import type { Project } from '@/shared/types/domain';
import { toCsv } from './OverviewCsv';
import { bySeverity, lifecyclePercent, nextMilestone, riskOf, stageTrack } from './OverviewModel';

const base = store.projects[0]!;
const make = (id: string, patch: Partial<Project>): Project => ({ ...base, id, name: id, ...patch });
const met = { delivery: 'met', releases: 'met', dependencies: 'met', cost: 'met', outcomes: 'met' } as const;

describe('overview model', () => {
  it('ranks breached before attention before clean projects', () => {
    const rows = [make('A', { position: met }), make('B', { position: { ...met, cost: 'attention' } }), make('C', { position: { ...met, delivery: 'breached' } })];
    expect(bySeverity(rows).map((p) => p.id)).toEqual(['C', 'B', 'A']);
  });

  it('never calls an unassessed project low risk', () => {
    expect(riskOf(make('U', { position: { ...met, outcomes: 'unknown' } })).label).toBe('Not assessed');
    expect(riskOf(make('M', { position: met })).label).toBe('Low risk');
  });

  it('places stages on the gated lifecycle and leaves paused work at zero', () => {
    expect(lifecyclePercent(make('S', { stage: 'Scaling' }))).toBe(100);
    expect(lifecyclePercent(make('P', { stage: 'Paused' }))).toBe(0);
  });

  it('marks the stage carrying the most breaches and open gates as active, empty stages as upcoming', () => {
    const open = [{ name: 'AI governance review', status: 'pending' as const, owner: 'Board' }];
    const track = stageTrack([make('B1', { stage: 'Build', position: { ...met, delivery: 'breached' }, gates: open }), make('L1', { stage: 'Live', position: met, gates: [] })]);
    const byKey = Object.fromEntries(track.map((s) => [s.key, s]));
    expect(byKey.Build?.state).toBe('active');
    expect(byKey.Build?.footLeft).toBe('AI governance review');
    expect(byKey.Live?.state).toBe('completed');
    expect(byKey.Scoping?.state).toBe('upcoming');
  });

  it('picks the earliest commitment that has no actual date', () => {
    const next = nextMilestone('P-101', store.commitments);
    expect(next?.actualDate).toBeUndefined();
  });

  it('quotes cells and neutralises spreadsheet formulas in CSV export', () => {
    expect(toCsv([['a,b', '=SUM(A1)', 'say "hi"']])).toBe('"a,b","\'=SUM(A1)","say ""hi"""');
  });
});
