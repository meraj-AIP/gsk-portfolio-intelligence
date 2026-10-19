import { describe, expect, it } from 'vitest';
import type { Evidence } from '@/shared/types/domain';
import { evidenceVersionAt } from './ResponseHistory';

const record: Evidence = {
  id: 'E-TEST', type: 'project update', source: 'Test source', date: '2026-10-10', version: 3, owner: 'Test owner', excerpt: '', context: '',
  fields: {}, originalAvailable: true,
  history: [{ version: 1, date: '2026-09-01', fields: {} }, { version: 2, date: '2026-09-20', fields: {} }],
};

describe('evidenceVersionAt', () => {
  it('picks the latest version dated on or before the response', () => {
    expect(evidenceVersionAt(record, '2026-09-25')).toBe(2);
    expect(evidenceVersionAt(record, '2026-09-20')).toBe(2);
    expect(evidenceVersionAt(record, '2026-10-12 09:00')).toBe(3);
  });

  it('returns undefined rather than guessing when the response predates every version', () => {
    expect(evidenceVersionAt(record, '2026-08-01')).toBeUndefined();
  });

  it('falls back to the current version when no history is kept', () => {
    expect(evidenceVersionAt({ ...record, history: undefined }, '2026-10-11')).toBe(3);
  });
});
