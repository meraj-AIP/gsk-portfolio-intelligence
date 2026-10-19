import type { Tone } from '@/shared/components/ui/StatusChip';
import type { Source, SourceIssue } from '@/shared/types/domain';

export const HEALTH: Record<Source['connectionHealth'], Tone> = { healthy: 'success', degraded: 'warning', failed: 'danger' };
export const QUALITY: Record<Source['contentQuality'], Tone> = { good: 'success', gaps: 'warning', conflicts: 'danger' };
export const STATUS_TONE: Record<NonNullable<SourceIssue['status']>, Tone> = { open: 'warning', 'correction requested': 'info', resolved: 'success' };

export const KIND_LABEL: Record<NonNullable<SourceIssue['kind']>, string> = {
  gap: 'Missing value', conflict: 'Conflicting values', mapping: 'Mapping to confirm', failure: 'Ingestion failure', flag: 'Flagged inconsistency',
};

/** Older records carry no kind or status; read them the way the write API would have classified them. */
export const issueKind = (i: SourceIssue): NonNullable<SourceIssue['kind']> =>
  i.kind ?? (i.description.startsWith('Nightly sync failed') ? 'failure' : i.conflictingValues ? 'conflict' : 'gap');
export const issueStatus = (i: SourceIssue): NonNullable<SourceIssue['status']> => i.status ?? (i.resolution ? 'resolved' : 'open');

/** "Plan: 2026-10-16; Register: 2026-10-23" becomes the two candidate values a reconciliation chooses between. */
export const candidateValues = (i: SourceIssue): string[] => (i.conflictingValues ?? '').split(';').map((v) => v.trim()).filter(Boolean);

export const needsRetry = (s: Source) => s.connectionHealth !== 'healthy';

/** Issues still needing someone: anything not resolved, wherever it came from. */
export const openIssues = (sources: Source[]) => sources.flatMap((s) => s.issues.filter((i) => issueStatus(i) !== 'resolved'));
