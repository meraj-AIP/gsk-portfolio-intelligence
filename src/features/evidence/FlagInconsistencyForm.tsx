import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useFlagInconsistency } from '@/shared/api/hooks';

/** Raises a source issue for the reconciliation owner. The confirmation names the issue so the user can follow it up. */
export function FlagInconsistencyForm({ evidenceId, onCancel }: { evidenceId: string; onCancel: () => void }) {
  const flag = useFlagInconsistency();
  const [note, setNote] = useState('');
  if (flag.data) {
    return (
      <Alert severity="success">
        Raised {flag.data.id} for {flag.data.reconciliationOwner} to reconcile. Follow it in <Link component={RouterLink} to="/sources">Sources and quality</Link>.
      </Alert>
    );
  }
  return (
    <Stack sx={{ gap: 1 }}>
      <TextField label="What looks inconsistent" value={note} onChange={(ev) => setNote(ev.target.value)} multiline minRows={2} autoFocus />
      {flag.error ? <Alert severity="error">{flag.error.message}</Alert> : null}
      <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" disabled={!note.trim() || flag.isPending} onClick={() => flag.mutate({ evidenceId, note })}>Send flag</Button>
      </Stack>
    </Stack>
  );
}
