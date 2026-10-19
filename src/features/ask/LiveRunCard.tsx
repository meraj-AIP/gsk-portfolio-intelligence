import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { TIME_LIMIT_MS, type LiveRun } from './useInvestigation';

/** A run that has not reached a terminal state yet. Once saved it is replaced by its stored record. */
export function LiveRunCard({ run, onCancel }: { run: LiveRun; onCancel: (run: LiveRun) => void }) {
  const cancellable = run.state !== 'saving';
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
        <Box>
          <Typography variant="subtitle1">{run.input.question}</Typography>
          <Typography variant="caption">Context: {run.input.contextIds.join(', ') || 'whole portfolio'}. Period: {run.input.period}. Run with your permissions.</Typography>
        </Box>
        <StatusChip tone="info">{run.state}</StatusChip>
      </Stack>
      {run.saveError ? <Alert severity="error">The run finished but was not saved: {run.saveError}</Alert> : (
        <Stack sx={{ gap: 1 }}>
          <LinearProgress color="secondary" />
          <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="caption">Permitted tools: read context, compare commitments, trace dependencies, calculate variance. Stops after {TIME_LIMIT_MS / 1000} seconds.</Typography>
            {cancellable ? <Button size="small" onClick={() => onCancel(run)}>Cancel</Button> : null}
          </Stack>
        </Stack>
      )}
    </Paper>
  );
}
