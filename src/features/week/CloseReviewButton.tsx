import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useCloseWeeklyReview } from '@/shared/api/hooks';
import { can } from '@/shared/lib/permissions';
import type { Snapshot } from '@/shared/types/governance';
import { GatedButton } from './GatedButton';
import { weekLabel } from './weekModel';

/** Closing freezes the open snapshot. The expected id travels with the request so a second click, or another tab, cannot close twice. */
export function CloseReviewButton({ open }: { open: Snapshot }) {
  const allowed = can(useAuth().user, 'close review');
  const close = useCloseWeeklyReview();
  const [confirming, setConfirming] = useState(false);
  const [closedLabel, setClosedLabel] = useState('');
  const label = weekLabel(open.week);

  const submit = () => close.mutate(open.id, {
    onSuccess: (next) => { setConfirming(false); setClosedLabel(`${label} review closed. ${weekLabel(next.week)} is now open; corrections to ${label.toLowerCase()} go in as amendments.`); },
  });

  return (
    <>
      <GatedButton allowed={allowed} reason="Only the portfolio lead closes the weekly review." variant="contained" color="secondary" disabled={close.isPending} onClick={() => { close.reset(); setConfirming(true); }}>
        Close {label.toLowerCase()} review
      </GatedButton>
      <Dialog open={confirming} onClose={() => setConfirming(false)} fullWidth maxWidth="xs">
        <DialogTitle>Close {label.toLowerCase()} review?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">The snapshot is frozen as it stands now and the next week opens. A closed review is never edited; later corrections are recorded as amendments with a reason.</Typography>
          {close.error ? <Alert severity="error" sx={{ mt: 2 }}>{close.error.message}</Alert> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirming(false)}>Cancel</Button>
          <Button variant="contained" disabled={close.isPending} onClick={submit}>{close.isPending ? 'Closing' : 'Close review'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(closedLabel)} autoHideDuration={8000} onClose={() => setClosedLabel('')}>
        <Alert severity="success" onClose={() => setClosedLabel('')}>{closedLabel}</Alert>
      </Snackbar>
    </>
  );
}
