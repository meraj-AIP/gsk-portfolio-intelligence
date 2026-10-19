import type { ReleaseSummary } from '@/shared/lib/constraints';
import { shortDate } from './weekModel';

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** The plain sentence that opens the releases tab. Counts each release once and treats withdrawn as not available. */
export function releaseLead(week: ReleaseSummary[]): string {
  const available = week.filter((s) => s.availableOn && !s.withdrawn);
  const late = available.filter((s) => (s.slipDays ?? 0) > 0);
  const waiting = week.filter((s) => !s.availableOn && !s.withdrawn);
  const withdrawn = week.filter((s) => s.withdrawn);
  const open = week.filter((s) => s.conditions.length);
  const parts = [
    available.length
      ? `${count(available.length, 'release')} became available this week, ${available.length - late.length} on or before the first planned date${late.length ? ` and ${late.length} later` : ''}.`
      : 'No release became available this week.',
    waiting.length ? `${waiting.length} not yet available${waiting.length === 1 && waiting[0]!.plannedLatest ? `, now planned for ${shortDate(waiting[0]!.plannedLatest)}` : ''}.` : '',
    withdrawn.length ? `${withdrawn.length} withdrawn.` : '',
    open.length ? `${count(open.length, 'release')} still ${open.length === 1 ? 'has' : 'have'} open conditions.` : '',
  ];
  return parts.filter(Boolean).join(' ');
}
