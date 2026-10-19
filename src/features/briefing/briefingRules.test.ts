import { describe, expect, it } from 'vitest';
import type { Briefing } from '@/shared/types/domain';
import { exportFileName, exportSections, MOVES, shownSections, teamsMessage, withExtras } from './briefingRules';
import type { BriefingItem } from './useBriefingItems';

const base: Briefing = {
  id: 'B-T1', audience: 'Business sponsors', scope: 'All programmes', period: 'Week 42', snapshotId: 'SNAP-T', status: 'published', version: 1, revision: 3, updatedAt: '2026-10-12',
  sections: [{ key: 'live', title: 'Live', narrative: 'Edited after publication', itemIds: [] }],
  published: { sections: [{ key: 'cost', title: 'Cost', narrative: 'Frozen text', itemIds: ['F-1', 'INV-01'] }], definitionVersions: { 'DEF-01': 2 }, publishedAt: '2026-10-12 16:10', publishedBy: 'Test lead' },
};
const resolve = (id: string): BriefingItem => (id === 'F-1'
  ? { id, kind: 'finding', label: 'Cost item', evidenceIds: [], reviewStatus: 'Owner confirmed', audienceRestricted: true }
  : { id, kind: 'investigation', label: 'Question', evidenceIds: [], reviewStatus: 'AI interpretation, not yet supported', needsSubstantiation: true });

describe('briefing rules', () => {
  it('shows frozen content for a published briefing and the working copy for a draft', () => {
    expect(shownSections(base)[0]?.narrative).toBe('Frozen text');
    expect(shownSections({ ...base, status: 'draft' })[0]?.narrative).toBe('Edited after publication');
  });

  it('hides restricted items for a non leadership audience and counts them', () => {
    const [s] = exportSections(base, resolve);
    expect(s?.items.map((i) => i.id)).toEqual(['INV-01']);
    expect(s?.hidden).toBe(1);
  });

  it('keeps the interpretation label and a link in the Teams message', () => {
    const text = teamsMessage(base, exportSections(base, resolve), 'https://example.test/briefing?briefing=B-T1', 'Drawn from the week 42 review snapshot.');
    expect(text).toContain('[AI interpretation, not yet supported]');
    expect(text).toContain('https://example.test/briefing?briefing=B-T1');
    expect(text).not.toContain('Cost item');
  });

  it('places figures after the cost section and always ends with unresolved conclusions', () => {
    const out = withExtras(exportSections(base, resolve), { stamp: 'Stamp.', figureLines: ['Forecast £1k.'], unresolved: [{ id: 'F-9', title: 'Open item', reason: 'Awaiting owner.' }], hiddenUnresolved: 1 });
    expect(out.map((s) => s.key)).toEqual(['cost', 'figures', 'unresolved']);
    expect(out[2]?.lines).toEqual(['Open item (F-9): Awaiting owner.']);
    expect(out[2]?.hidden).toBe(1);
    const text = teamsMessage(base, out, 'https://example.test', 'Stamp.');
    expect(text).toContain('- Forecast £1k.');
    expect(text).toContain('**Unresolved conclusions**');
  });

  it('names the file by audience and period without unsafe characters', () => {
    expect(exportFileName({ ...base, audience: 'Data & AI / leads' })).toBe('Data-AI-leads-Week-42');
  });

  it('offers publishing only from approved, and only under the publish capability', () => {
    expect(MOVES.draft?.map((m) => m.to)).toEqual(['under review']);
    expect(MOVES.approved?.find((m) => m.to === 'published')?.capability).toBe('publish briefing');
    expect(MOVES.published).toBeUndefined();
  });
});
