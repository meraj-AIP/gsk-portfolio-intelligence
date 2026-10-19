import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useRecordDecision } from '@/shared/api/hooks';
import type { Action } from '@/shared/types/domain';

type Props = { findingId: string; defaultQuestion: string; actions: Action[]; onDone: () => void };

/** Sponsor records a decision without leaving the finding, already linked to it and to any of its actions. */
export function InlineDecisionForm({ findingId, defaultQuestion, actions, onDone }: Props) {
  const record = useRecordDecision();
  const [question, setQuestion] = useState(defaultQuestion);
  const [conclusion, setConclusion] = useState('');
  const [conditions, setConditions] = useState('');
  const [reference, setReference] = useState('');
  const [linked, setLinked] = useState<string[]>([]);
  const toggle = (id: string) => setLinked((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const submit = () => record.mutate({ question, conclusion, conditions, reference, actionIds: linked, findingId }, { onSuccess: onDone });
  return (
    <Stack sx={{ gap: 1.25 }}>
      <Typography variant="subtitle2">Record decision</Typography>
      <TextField size="small" label="Question decided" value={question} onChange={(e) => setQuestion(e.target.value)} required />
      <TextField size="small" label="Conclusion" value={conclusion} onChange={(e) => setConclusion(e.target.value)} multiline minRows={2} required />
      <TextField size="small" label="Conditions" value={conditions} onChange={(e) => setConditions(e.target.value)} />
      <TextField size="small" label="Authoritative reference" value={reference} onChange={(e) => setReference(e.target.value)} helperText="Minutes, approval or record that holds the decision" />
      {actions.length ? (
        <Stack>
          <Typography variant="caption">Actions this decision settles</Typography>
          {actions.map((a) => <FormControlLabel key={a.id} control={<Checkbox size="small" checked={linked.includes(a.id)} onChange={() => toggle(a.id)} />} label={`${a.id}: ${a.title}`} />)}
        </Stack>
      ) : null}
      {record.error ? <Alert severity="error">{record.error.message} Your draft is kept.</Alert> : null}
      <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
        <Button onClick={onDone}>Cancel</Button>
        <Button variant="contained" disabled={!question.trim() || !conclusion.trim() || record.isPending} onClick={submit}>{record.isPending ? 'Recording' : 'Record decision'}</Button>
      </Stack>
    </Stack>
  );
}
