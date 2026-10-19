import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useReview } from '@/app/context/ReviewContext';
import { weekLabel } from '@/app/context/weekLabel';
import { useSnapshots } from '@/shared/api/hooks';

/** Past reviews are frozen records, so the shell says so on every screen while one is selected. */
export function ReadOnlyBanner() {
  const { isReadOnly, viewSnapshot, setScope } = useReview();
  const snapshots = useSnapshots();
  if (!isReadOnly || !viewSnapshot) return null;
  const open = snapshots.data?.find((s) => s.status === 'open');
  return (
    <Alert severity="info" variant="outlined" sx={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0 }}
      action={open ? <Button color="inherit" size="small" onClick={() => setScope({ viewSnapshotId: open.id })}>Go to current review</Button> : undefined}>
      You are viewing the {viewSnapshot.status} {weekLabel(viewSnapshot)} review. It is read-only.
    </Alert>
  );
}
