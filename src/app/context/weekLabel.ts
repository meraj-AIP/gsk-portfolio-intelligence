import type { Snapshot } from '@/shared/types/domain';

/** "week 40" from a snapshot's ISO week, for sentences such as "was attention in week 40". */
export const weekLabel = (s: Pick<Snapshot, 'week'> | undefined): string => (s ? `week ${Number(s.week.split('-W')[1] ?? s.week)}` : '');
