import { describe, expect, it } from 'vitest';
import type { Commitment, Finding } from '@/shared/types/domain';
import { buildQueue, isoWeek, itemStatus, reviewPeriod, type QueueItem } from './weekModel';

describe('isoWeek', () => {
  it('matches the ISO calendar, including the year boundary', () => {
    expect(isoWeek('2026-09-11')).toBe('2026-W37');
    expect(isoWeek('2026-10-09')).toBe('2026-W41');
    expect(isoWeek('2026-01-01')).toBe('2026-W01');
    expect(isoWeek('2027-01-01')).toBe('2026-W53');
    expect(isoWeek('2024-12-30')).toBe('2025-W01');
  });
});

describe('buildQueue continuity', () => {
  const period = reviewPeriod({ week: '2026-W41', date: '2026-10-12' });
  const commitment = (id: string, baselineDate: string): Commitment => ({
    id, projectId: 'P-1', title: `Commitment ${id}`, baselineDate, currentDate: '2026-10-16', owner: 'Test owner', status: 'carried forward', evidenceId: 'E-1', week: '2026-W41',
  });
  const finding = { id: 'F-1', title: 'Test finding', category: 'decision needed', statementType: 'reported fact', affectedIds: ['P-1'], previousPosition: 'a', currentPosition: 'b', significance: '', evidenceIds: [], unknowns: '', version: 1, firstSeenWeek: '2026-W39', persistent: true, responses: [] } as unknown as Finding;

  it('marks carried-forward work with the week it was first due, and nothing that falls due this week', () => {
    const items = buildQueue([], [commitment('C-1', '2026-09-11'), commitment('C-2', '2026-10-09')], [], [], [finding], period);
    expect(items.find((i) => i.id === 'C-1')?.openSince).toBe('2026-W37');
    expect(items.find((i) => i.id === 'C-2')?.openSince).toBeUndefined();
    expect(items.find((i) => i.id === 'F-1')?.openSince).toBe('2026-W39');
  });
});

describe('itemStatus', () => {
  const period = reviewPeriod({ week: '2026-W41', date: '2026-10-12' });
  const base: QueueItem = { id: 'F-1', group: 'Decisions and responses required', projectId: 'P-1', projectName: 'Synthetic', title: 't', owner: 'o', previous: 'a', current: 'b', date: '2026-10-08', evidenceId: 'E-1', kind: 'finding' };

  it('marks a response due before the review end as overdue', () => {
    expect(itemStatus({ ...base, responseDue: '2026-10-09' }, period)).toEqual({ tone: 'danger', text: 'Response overdue, due 9 Oct' });
  });
  it('keeps a response due on or after the review end as a warning', () => {
    expect(itemStatus({ ...base, responseDue: '2026-10-12' }, period).tone).toBe('warning');
  });
  it('reads release availability from the recorded current position', () => {
    const release = { ...base, group: 'Releases delivered or moved' as const, kind: 'release' as const };
    expect(itemStatus({ ...release, current: 'Available 2026-10-08' }, period).text).toBe('Available');
    expect(itemStatus({ ...release, current: 'Moved to 2026-10-20' }, period).text).toBe('Moved');
  });
});
