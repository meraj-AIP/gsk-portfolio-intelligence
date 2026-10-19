import Stack from '@mui/material/Stack';
import { useAuth } from '@/features/auth/AuthContext';
import { useInvestigations } from '@/shared/api/hooks';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { InvestigationResultCard } from './InvestigationResultCard';
import { LiveRunCard } from './LiveRunCard';
import type { LiveRun } from './useInvestigation';

type Props = { live: LiveRun[]; onCancel: (run: LiveRun) => void; onRefine: (q: string) => void; contextIds?: string[] };

/** An empty filter means the whole portfolio, so every run is relevant. */
const overlaps = (ids: string[], filter: string[] | undefined) => !filter?.length || ids.some((i) => filter.includes(i));

/** Runs in flight first, then the user's saved runs newest first. Saved runs come from the store, so they survive navigation. */
export function RunHistory({ live: allLive, onCancel, onRefine, contextIds }: Props) {
  const { user } = useAuth();
  const saved = useInvestigations();
  const live = allLive.filter((r) => overlaps(r.input.contextIds, contextIds));
  const mine = (saved.data ?? []).filter((r) => r.requestedBy === user?.name && overlaps(r.contextIds, contextIds)).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return (
    <Stack sx={{ gap: 2 }}>
      {live.map((r) => <LiveRunCard key={r.id} run={r} onCancel={onCancel} />)}
      {saved.isLoading ? <LoadingState rows={3} /> : null}
      {saved.isError ? <ErrorState message={saved.error.message} onRetry={() => void saved.refetch()} /> : null}
      {saved.isSuccess && mine.length === 0 && live.length === 0 ? (
        <EmptyState title="No investigations about this yet" hint="Pick a question above and run it. Earlier runs about the same work appear here." />
      ) : null}
      {mine.map((r) => <InvestigationResultCard key={r.id} run={r} onRefine={onRefine} />)}
    </Stack>
  );
}
