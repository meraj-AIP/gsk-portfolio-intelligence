import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useCreateAction } from '@/shared/api/hooks';
import { today } from '@/shared/api/store';
import { addWorkingDays } from '@/shared/components/RequestDialogs';

type Props = { findingId: string; defaultOwner: string; onDone: () => void };

/** Assigns a follow-up action already linked to the finding, so its completion counts toward resolution. */
export function InlineActionForm({ findingId, defaultOwner, onDone }: Props) {
  const create = useCreateAction();
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState(defaultOwner);
  const [dueDate, setDueDate] = useState(addWorkingDays(today, 5));
  const submit = () => create.mutate({ title: title.trim(), owner: owner.trim(), dueDate, findingId }, { onSuccess: onDone });
  return (
    <Stack sx={{ gap: 1.25 }}>
      <Typography variant="subtitle2">Assign action</Typography>
      <TextField size="small" label="Action" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1 }}>
        <TextField size="small" label="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} required fullWidth />
        <TextField size="small" label="Due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      </Stack>
      {create.error ? <Alert severity="error">{create.error.message} Your draft is kept.</Alert> : null}
      <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
        <Button onClick={onDone}>Cancel</Button>
        <Button variant="contained" disabled={!title.trim() || !owner.trim() || !dueDate || create.isPending} onClick={submit}>{create.isPending ? 'Assigning' : 'Assign action'}</Button>
      </Stack>
    </Stack>
  );
}
