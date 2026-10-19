import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import type { ExtrasState } from './useBriefingExtras';

type Props = { open: boolean; state: ExtrasState; onCancel: () => void; onConfirm: () => void };

/** Publishing freezes the content, so the publisher confirms knowing how many open conclusions go out with it. */
export function PublishConfirmDialog({ open, state, onCancel, onConfirm }: Props) {
  const x = state.extras;
  const n = x ? x.unresolved.length + x.hiddenUnresolved : 0;
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>Publish this briefing</DialogTitle>
      <DialogContent>
        {state.error ? <ErrorState message="Unresolved conclusions could not be counted. Retry before publishing." onRetry={state.retry} />
          : !x ? <LoadingState rows={2} />
            : (
              <>
                <Typography variant="body1">
                  {n === 0 ? 'No unresolved conclusions are included.' : `${n} unresolved conclusion${n === 1 ? ' is' : 's are'} included and will be published with ${n === 1 ? 'its' : 'their'} current status.`}
                </Typography>
                {x.unresolved.map((u) => <Typography key={u.id} variant="body2" sx={{ mt: 0.5 }}>{u.title}: {u.reason}</Typography>)}
                {x.hiddenUnresolved ? <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>{x.hiddenUnresolved} of these are hidden from this audience.</Typography> : null}
                <Typography variant="body2" sx={{ mt: 1.5 }}>{x.stamp} Published content is frozen; later corrections go into a revision.</Typography>
              </>
            )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" disabled={!x} onClick={onConfirm}>Publish</Button>
      </DialogActions>
    </Dialog>
  );
}
