import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useConfirmAllocation, useReconcileCost } from '@/shared/api/hooks';
import type { CostRecord } from '@/shared/types/domain';

export type CostAction = 'confirm' | 'reconcile';

type Props = { record: CostRecord; action: CostAction; onClose: () => void };

/** One dialog for both Finance writes; they differ only in the text captured and the mutation called. */
export function CostRecordDialog({ record, action, onClose }: Props) {
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'));
  const confirm = useConfirmAllocation();
  const reconcile = useReconcileCost();
  const [text, setText] = useState(action === 'confirm' ? record.allocationBasis : '');
  const m = action === 'confirm' ? confirm : reconcile;
  const submit = () => {
    if (action === 'confirm') confirm.mutate({ costRecordId: record.id, basis: text }, { onSuccess: onClose });
    else reconcile.mutate({ costRecordId: record.id, note: text }, { onSuccess: onClose });
  };
  return (
    <Dialog open onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm">
      <DialogTitle>{action === 'confirm' ? `Confirm allocation basis for ${record.id}` : `Reconcile ${record.id}`}</DialogTitle>
      <DialogContent>
        <TextField sx={{ mt: 1 }} fullWidth multiline minRows={2} required
          label={action === 'confirm' ? 'Allocation basis' : 'Reconciliation note'}
          helperText={action === 'confirm' ? 'Shared costs stay out of project totals until the basis is confirmed (DEF-06).' : 'Say what was checked against the ledger and any difference found.'}
          value={text} onChange={(e) => setText(e.target.value)} />
        {m.error ? <Alert severity="error" sx={{ mt: 2 }}>{m.error.message}</Alert> : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!text.trim() || m.isPending} onClick={submit}>{action === 'confirm' ? 'Confirm basis' : 'Record reconciliation'}</Button>
      </DialogActions>
    </Dialog>
  );
}
