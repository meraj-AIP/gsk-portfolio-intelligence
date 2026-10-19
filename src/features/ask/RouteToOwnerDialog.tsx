import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { useRouteInvestigation } from '@/shared/api/hooks';
import { today } from '@/shared/api/store';
import { addWorkingDays } from '@/shared/components/RequestDialogs';
import { FindingLink } from './FindingLink';

/** Turns a completed answer into an AI interpretation finding that a named owner must respond to. */
export function RouteToOwnerDialog({ investigationId, onClose }: { investigationId: string; onClose: () => void }) {
  const route = useRouteInvestigation();
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState(addWorkingDays(today, 3));
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Route to owner</DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2, mt: 1 }}>
          {route.data ? (
            <Alert severity="success">Created finding <FindingLink id={route.data.id} /> for {route.data.requestedOwner}. It stays an AI interpretation until they respond.</Alert>
          ) : (
            <>
              <TextField label="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} required />
              <TextField label="Response due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            </>
          )}
          {route.error ? <Alert severity="error">{route.error.message}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{route.data ? 'Close' : 'Cancel'}</Button>
        {route.data ? null : (
          <Button variant="contained" disabled={!owner.trim() || !dueDate || route.isPending} onClick={() => route.mutate({ investigationId, owner: owner.trim(), dueDate })}>Route</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
