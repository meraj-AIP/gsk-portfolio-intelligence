import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useAmendSnapshot } from '@/shared/api/hooks';
import type { Snapshot } from '@/shared/types/governance';

type Props = { snapshot: Snapshot; onClose: () => void };

/** Mounted only while open, so each amendment starts from empty fields and a clean mutation. */
export function AmendDialog({ snapshot, onClose }: Props) {
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'));
  const amend = useAmendSnapshot();
  const [recordId, setRecordId] = useState('');
  const [correction, setCorrection] = useState('');
  const [reason, setReason] = useState('');
  const ready = recordId.trim() && correction.trim() && reason.trim();
  const submit = () => amend.mutate({ snapshotId: snapshot.id, recordId: recordId.trim(), correction, reason }, { onSuccess: onClose });
  return (
    <Dialog open onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm">
      <DialogTitle>Amend {snapshot.label}</DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2, mt: 1 }}>
          <Typography variant="body2">The closed snapshot stays as it was. The correction is added alongside it with your name, today&apos;s date and the reason.</Typography>
          <TextField label="Record id" value={recordId} onChange={(e) => setRecordId(e.target.value)} required helperText="The commitment, finding or project the correction applies to, for example C-11." />
          <TextField label="Correction" value={correction} onChange={(e) => setCorrection(e.target.value)} required multiline minRows={2} />
          <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} required multiline minRows={2} />
          {amend.error ? <Alert severity="error">{amend.error.message}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!ready || amend.isPending} onClick={submit}>Record amendment</Button>
      </DialogActions>
    </Dialog>
  );
}
