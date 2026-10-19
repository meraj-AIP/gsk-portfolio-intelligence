import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useCreateAction } from '@/shared/api/hooks';
import type { Dependency } from '@/shared/types/domain';

type Props = { open: boolean; onClose: () => void; dependency: Dependency; onCreated: (actionId: string) => void };

/** Assigns a follow-up action on a dependency. Owner defaults to whoever owns the dependency. */
export function FollowUpDialog({ open, onClose, dependency: d, onCreated }: Props) {
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'));
  const [title, setTitle] = useState(`Resolve ${d.id}: ${d.description.slice(0, 60)}`);
  const [owner, setOwner] = useState(d.owner);
  const [dueDate, setDueDate] = useState(d.requiredDate);
  const create = useCreateAction();
  const submit = () => create.mutate({ title: title.trim(), owner: owner.trim(), dueDate }, { onSuccess: (a) => { onCreated(a.id); onClose(); } });
  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm">
      <DialogTitle>Create follow-up action</DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2, mt: 1 }}>
          <TextField label="Action" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextField label="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} required helperText="Defaults to the dependency owner." />
          <TextField label="Due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText="Defaults to the date the dependency is required." />
          {create.error ? <Alert severity="error">{create.error.message}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!title.trim() || !owner.trim() || !dueDate || create.isPending} onClick={submit}>Assign action</Button>
      </DialogActions>
    </Dialog>
  );
}
