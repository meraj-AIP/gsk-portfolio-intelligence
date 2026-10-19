import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { QUESTION_TEMPLATES } from '@/shared/api/investigationApi';
import type { AskContext } from './useAskContext';

type Props = { initialQuestion: string; context: AskContext; period: string; role: string; onRun: (question: string) => void };

/** The question box. Keyed by the URL question, so a new link or a refine reseeds it. */
export function AskForm({ initialQuestion, context, period, role, onRun }: Props) {
  const [question, setQuestion] = useState(initialQuestion);
  const run = () => { if (question.trim()) onRun(question.trim()); };
  return (
    <Stack sx={{ gap: 1.5 }}>
      <Typography variant="body2">
        <strong>About:</strong> {context.label}. {context.error ? `Context could not be fully loaded: ${context.error}.` : ''}
      </Typography>
      <Typography variant="caption">Period {period}, viewing as {role}. Runs with your permissions only.</Typography>
      <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
        {QUESTION_TEMPLATES.map((t) => <Chip key={t} size="small" label={t} variant={question === t ? 'filled' : 'outlined'} onClick={() => setQuestion(t)} />)}
      </Stack>
      <TextField fullWidth size="small" label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') run(); }} />
      <Button variant="contained" onClick={run} disabled={!question.trim() || context.loading} sx={{ alignSelf: 'flex-start' }}>
        {context.loading ? 'Loading context' : 'Investigate'}
      </Button>
    </Stack>
  );
}
