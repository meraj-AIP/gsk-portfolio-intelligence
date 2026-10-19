import Typography from '@mui/material/Typography';
import { useProgrammeContribution } from '@/shared/api/hooks';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';

/** Business contribution story for an expanded programme. Built by fixed rules from records, so it is labelled as calculated. */
export function OverviewContribution({ programmeId }: { programmeId: string }) {
  const q = useProgrammeContribution(programmeId);
  if (q.isError) return <ErrorState message="The business contribution could not be calculated." onRetry={() => void q.refetch()} />;
  if (q.isLoading) return <LoadingState rows={1} />;
  if (!q.data) return <Typography variant="body2" sx={{ color: 'text.secondary' }}>No contribution record for this programme.</Typography>;
  return (
    <>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Business contribution, calculated from programme records</Typography>
      <Typography variant="body2">{q.data.narrative}</Typography>
    </>
  );
}
