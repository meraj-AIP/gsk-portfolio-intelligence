import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useAnswerClarification } from '@/shared/api/hooks';
import type { Clarification } from '@/shared/types/workflow';

/** The owner's answer is a reported statement from that person, recorded under their name. */
export function AnswerClarificationDialog({ request, onClose }: { request: Clarification; onClose: () => void }) {
  const answer = useAnswerClarification();
  const [text, setText] = useState('');
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Answer {request.id}</DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 2, mt: 1 }}>
          <Typography variant="body2">{request.requestedBy} asked: {request.question}</Typography>
          <TextField label="Your answer" value={text} onChange={(e) => setText(e.target.value)} multiline minRows={3} required />
          {answer.error ? <Alert severity="error">{answer.error.message}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!text.trim() || answer.isPending} onClick={() => answer.mutate({ id: request.id, answer: text }, { onSuccess: onClose })}>Send answer</Button>
      </DialogActions>
    </Dialog>
  );
}
