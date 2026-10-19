import { describe, expect, it } from 'vitest';
import type { BriefingFigures } from '@/shared/lib/assessment';
import type { Briefing, Snapshot } from '@/shared/types/domain';
import { briefingExtras, figureLines, snapshotWarnings, stampText } from './briefingFigures';
import type { BriefingItem } from './useBriefingItems';

const LEAD = 'Enterprise Data and AI leadership';
const figures: BriefingFigures = {
  snapshotId: 'SNAP-W41',
  cost: { budget: 1_000_000, actual: 400_000, forecast: 1_080_000, variance: 80_000, sharedExcluded: 50_000, coverage: 9, of: 12 },
  measuredOutcomes: 2, forecastBenefits: 5,
  unresolved: [{ id: 'F-1', title: 'Cost overrun', reason: 'Awaiting owner.' }, { id: 'F-2', title: 'Access decision', reason: 'Decision needed.' }],
};
const w41: Snapshot = { id: 'SNAP-W41', week: '2026-W41', label: 'Week 41 review', date: '2026-10-12', status: 'open' };
const w40: Snapshot = { id: 'SNAP-W40', week: '2026-W40', label: 'Week 40 review', date: '2026-10-05', status: 'closed' };
const briefing = { id: 'B-1', audience: LEAD, scope: 'All programmes', period: 'Week 41', snapshotId: 'SNAP-W41' } as Briefing;
const resolve = (id: string): BriefingItem => ({ id, kind: 'finding', label: id, evidenceIds: [], reviewStatus: '', audienceRestricted: id === 'F-1' });

describe('briefing figures', () => {
  it('stamps the week and date of the snapshot', () => {
    expect(stampText(w41, 'SNAP-W41')).toBe('Drawn from the week 41 review snapshot, as of 12 Oct 2026.');
    expect(stampText(undefined, 'SNAP-X')).toContain('could not be found');
  });

  it('warns when the label and snapshot disagree or the review bar shows another week', () => {
    expect(snapshotWarnings(briefing, w41, w41)).toEqual([]);
    expect(snapshotWarnings({ ...briefing, period: 'Week 42' }, w41, w41)[0]).toContain('labelled Week 42');
    expect(snapshotWarnings(briefing, w41, w40)[0]).toContain('review bar shows Week 40 review');
    expect(snapshotWarnings(briefing, undefined, w41)[0]).toContain('does not exist');
  });

  it('states variance, coverage and shared exclusion, and keeps outcomes and benefits apart', () => {
    const lines = figureLines(figures, LEAD);
    expect(lines).toContain('Forecast is £80k over budget (8 percent).');
    expect(lines).toContain('Direct cost records cover 9 of 12 projects in scope.');
    expect(lines.some((l) => l.includes('£50k of shared cost is excluded'))).toBe(true);
    expect(lines.at(-1)).toMatch(/^2 outcomes measured; 5 benefits still a forecast/);
  });

  it('withholds cost totals and restricted conclusions from other audiences', () => {
    const x = briefingExtras({ ...briefing, audience: 'Business sponsors' }, figures, w41, resolve);
    expect(x.figureLines[0]).toBe('Cost figures are restricted to leadership.');
    expect(x.figureLines.join(' ')).not.toContain('£');
    expect(x.unresolved.map((u) => u.id)).toEqual(['F-2']);
    expect(x.hiddenUnresolved).toBe(1);
  });

  it('never writes dashes into exported copy', () => {
    expect(figureLines(figures, LEAD).join(' ')).not.toMatch(/[\u2013\u2014]/);
  });
});
