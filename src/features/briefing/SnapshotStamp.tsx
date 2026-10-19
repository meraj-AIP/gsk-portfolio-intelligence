import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useReview } from '@/app/context/ReviewContext';
import { useSnapshots } from '@/shared/api/hooks';
import type { Briefing } from '@/shared/types/domain';
import { snapshotWarnings, stampText } from './briefingFigures';

/** Says which review the briefing is drawn from, and warns when that is not what the reader expects. */
export function SnapshotStamp({ briefing }: { briefing: Briefing }) {
  const snapshots = useSnapshots();
  const { viewSnapshot } = useReview();
  if (snapshots.isError) return <Alert severity="error" sx={{ mb: 2 }}>The snapshot list could not be loaded, so the source review cannot be confirmed.</Alert>;
  if (!snapshots.data) return <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>Checking the source snapshot.</Typography>;
  const snap = snapshots.data.find((s) => s.id === briefing.snapshotId);
  const warnings = snapshotWarnings(briefing, snap, viewSnapshot);
  return (
    <Stack sx={{ gap: 1, mb: 3 }}>
      <Stack direction="row" sx={(t) => ({ gap: 1.5, alignItems: 'center', flexWrap: 'wrap', px: 2, py: 1.25, borderRadius: 2, bgcolor: t.palette.background.paper, border: `1px solid ${t.palette.divider}` })}>
        <Typography variant="overline">Source snapshot</Typography>
        <Typography variant="body2">{stampText(snap, briefing.snapshotId)}</Typography>
      </Stack>
      {warnings.length ? <Alert severity="warning">{warnings.join(' ')}</Alert> : null}
    </Stack>
  );
}
