import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, type ReactNode } from 'react';
import { useBriefingTray } from '@/app/context/BriefingTrayContext';
import { useAuth } from '@/features/auth/AuthContext';
import { EntityLink } from '@/shared/components/EntityLink';
import { formatDate } from '@/shared/lib/format';
import { can } from '@/shared/lib/permissions';
import type { InvestigationRecord } from '@/shared/types/workflow';
import { FindingLink } from './FindingLink';
import { RouteToOwnerDialog } from './RouteToOwnerDialog';

const STATE_COLOUR: Record<InvestigationRecord['state'], 'default' | 'success' | 'error' | 'warning'> = {
  completed: 'success', failed: 'error', cancelled: 'default', 'awaiting clarification': 'warning', 'timed out': 'error',
};

const REFINEMENTS = ['What changed against the previous commitment?', 'Where is expenditure diverging from plan?', 'Which actions are still unresolved?'];

function Labelled({ label, children }: { label: string; children: ReactNode }) {
  return <Box><Typography variant="caption">{label}</Typography><Typography variant="body2" component="div">{children}</Typography></Box>;
}

/** Every answer is labelled as AI interpretation and carries its method, inputs, evidence and uncertainties. */
function Answer({ run }: { run: InvestigationRecord }) {
  return (
    <Box sx={{ borderLeft: 3, borderColor: 'secondary.main', pl: 1.5 }}>
      <Stack sx={{ gap: 1.25 }}>
        <Chip size="small" color="secondary" variant="outlined" label="AI interpretation, not a reported fact" sx={{ alignSelf: 'flex-start' }} />
        <Typography variant="body1">{run.answer}</Typography>
        <Labelled label="Method">{run.method ?? 'Not recorded.'}</Labelled>
        <Labelled label="Inputs">{run.contextIds.join(', ') || 'Whole portfolio'}, {run.period}</Labelled>
        <Labelled label="Evidence">
          {run.evidenceIds.length ? <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>{run.evidenceIds.map((e) => <EntityLink key={e} id={e} />)}</Stack> : 'No evidence record supports this answer directly.'}
        </Labelled>
        <Labelled label="Uncertainties">
          {run.uncertainties.length ? run.uncertainties.map((u) => <Typography key={u} variant="body2">{u}</Typography>) : 'None stated by the method. That is not the same as verified.'}
        </Labelled>
        {run.proposedResponse ? <Labelled label="Proposed next response">{run.proposedResponse}</Labelled> : null}
      </Stack>
    </Box>
  );
}

type Props = { run: InvestigationRecord; onRefine: (q: string) => void };

export function InvestigationResultCard({ run, onRefine }: Props) {
  const tray = useBriefingTray();
  const { user } = useAuth();
  const [routing, setRouting] = useState(false);
  const completed = run.state === 'completed';
  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
        <Box>
          <Typography variant="subtitle1">{run.question}</Typography>
          <Typography variant="caption">{run.id}, {formatDate(run.startedAt.slice(0, 10))}. Context: {run.contextIds.join(', ') || 'whole portfolio'}. Period: {run.period}. Run with your permissions.</Typography>
        </Box>
        <Chip label={run.state} color={STATE_COLOUR[run.state]} variant="outlined" />
      </Stack>
      {run.state === 'failed' || run.state === 'timed out' ? <Alert severity="error">{run.answer ?? 'The investigation did not finish.'}</Alert> : null}
      {run.state === 'cancelled' ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>Cancelled before completion. No external action was taken.</Typography> : null}
      {run.state === 'awaiting clarification' ? (
        <Stack sx={{ gap: 1 }}>
          <Alert severity="warning">{run.answer}</Alert>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>{REFINEMENTS.map((q) => <Button key={q} variant="outlined" onClick={() => onRefine(q)}>{q}</Button>)}</Stack>
        </Stack>
      ) : null}
      {completed ? (
        <Stack sx={{ gap: 1.5 }}>
          <Answer run={run} />
          {run.findingId ? <Alert severity="info" variant="outlined">Routed to {run.routedTo} as finding <FindingLink id={run.findingId} />.</Alert> : null}
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            {can(user, 'add to briefing') ? <Button variant="outlined" disabled={tray.has(run.id)} onClick={() => tray.add(run.id)}>{tray.has(run.id) ? 'In briefing' : 'Add to briefing'}</Button> : null}
            {can(user, 'request response') && !run.findingId ? <Button variant="outlined" onClick={() => setRouting(true)}>Route to owner</Button> : null}
            <Button variant="outlined" onClick={() => onRefine(run.question)}>Refine question</Button>
          </Stack>
        </Stack>
      ) : null}
      {routing ? <RouteToOwnerDialog investigationId={run.id} onClose={() => setRouting(false)} /> : null}
    </Paper>
  );
}
