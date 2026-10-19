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
import { useRequestClarification, useRequestResponse } from '@/shared/api/hooks';
import { today } from '@/shared/api/store';

/** Adds working days to an ISO date. Defaults come from the routing definitions (DEF-11: 3 days, DEF-12: 5 days). */
export function addWorkingDays(iso: string, days: number): string {
  let t = Date.parse(`${iso}T00:00:00Z`);
  let added = 0;
  while (added < days) {
    t += 86_400_000;
    const weekday = new Date(t).getUTCDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return new Date(t).toISOString().slice(0, 10);
}

type ResponseProps = { open: boolean; onClose: () => void; findingId: string; defaultOwner?: string };

/** Portfolio lead asks a named owner to respond to a finding by a date. */
export function RequestResponseDialog({ open, onClose, findingId, defaultOwner = '' }: ResponseProps) {
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'));
  const [owner, setOwner] = useState(defaultOwner);
  const [dueDate, setDueDate] = useState(addWorkingDays(today, 3));
  const [note, setNote] = useState('');
  const req = useRequestResponse();
  const submit = () => req.mutate({ findingId, owner, dueDate, note }, { onSuccess: onClose });
  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm">
      <DialogTitle>Request owner response</DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2, mt: 1 }}>
          <TextField label="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} required />
          <TextField label="Response due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText="Default is three working days (response routing, DEF-11)." />
          <TextField label="What you need from them" value={note} onChange={(e) => setNote(e.target.value)} multiline minRows={2} />
          {req.error ? <Alert severity="error">{req.error.message}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!owner.trim() || req.isPending} onClick={submit}>Send request</Button>
      </DialogActions>
    </Dialog>
  );
}

type ClarifyProps = { open: boolean; onClose: () => void; targetId: string; owner: string; prompt?: string };

/** Asks the owner of a dependency, release or record a question. It goes to the person, not to the AI. */
export function ClarificationDialog({ open, onClose, targetId, owner, prompt = '' }: ClarifyProps) {
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'));
  const [question, setQuestion] = useState(prompt);
  const [dueDate, setDueDate] = useState(addWorkingDays(today, 5));
  const req = useRequestClarification();
  const submit = () => req.mutate({ targetId, owner, question, dueDate });
  const close = () => { req.reset(); onClose(); };
  return (
    <Dialog open={open} onClose={close} fullScreen={fullScreen} fullWidth maxWidth="sm">
      <DialogTitle>Request clarification from {owner}</DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2, mt: 1 }}>
          <TextField label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} multiline minRows={3} required />
          <TextField label="Answer needed by" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText="Default is five working days (clarification routing, DEF-12)." />
          {req.isSuccess ? <Alert severity="success">Sent. It appears in {owner}&apos;s My work and in Decisions and actions.</Alert> : null}
          {req.error ? <Alert severity="error">{req.error.message}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        {req.isSuccess ? <Button variant="contained" onClick={close}>Done</Button> : (
          <>
            <Button onClick={close}>Cancel</Button>
            <Button variant="contained" disabled={!question.trim() || req.isPending} onClick={submit}>Send to owner</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
