import type { Tone } from '@/shared/components/ui/StatusChip';
import type { ReleaseSummary } from '@/shared/lib/constraints';
import { shortDate } from './weekModel';

/** Availability state for the card and panel chip. Withdrawn wins; lateness is calculated from the recorded plan and availability dates. */
export function releaseStatus(s: ReleaseSummary): { tone: Tone; text: string } {
  const moved = Boolean(s.plannedLatest && s.plannedFirst && s.plannedLatest !== s.plannedFirst);
  if (s.withdrawn) return { tone: 'neutral', text: 'Withdrawn' };
  if (s.availableOn) return (s.slipDays ?? 0) > 0 ? { tone: 'warning', text: 'Available late' } : { tone: 'success', text: 'Available' };
  if (moved && s.plannedLatest) return { tone: 'warning', text: `Moved to ${shortDate(s.plannedLatest)}` };
  return { tone: 'info', text: 'Not yet available' };
}

/** Calculated from the first planned and first available dates. */
export const slipText = (d: number) => (d > 0 ? `${d} day${d === 1 ? '' : 's'} after first plan` : d < 0 ? `${-d} day${d === -1 ? '' : 's'} before first plan` : 'On the first planned date');
