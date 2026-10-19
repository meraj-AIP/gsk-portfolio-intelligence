import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useInvestigations } from '@/shared/api/hooks';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import type { InvestigationRecord } from '@/shared/types/workflow';

const STATE_COLOR: Record<InvestigationRecord['state'], 'success' | 'warning' | 'error' | 'default'> = {
  completed: 'default', 'awaiting clarification': 'warning', failed: 'error', 'timed out': 'error', cancelled: 'default',
};

/** Every investigation run with who asked and where it went. Answers are interpretation, so only the question is listed. */
export function InvestigationRuns() {
  const runs = useInvestigations();
  if (runs.isError) return <ErrorState message="Investigation runs could not be loaded." onRetry={() => void runs.refetch()} />;
  if (!runs.data) return <LoadingState rows={3} />;
  if (runs.data.length === 0) return <EmptyState title="No investigation runs yet" hint="Questions asked in Ask the portfolio during this session appear here with their outcome." />;
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 800 }}>
        <TableHead><TableRow><TableCell>Started</TableCell><TableCell>Who</TableCell><TableCell>Scope</TableCell><TableCell>Question</TableCell><TableCell>State</TableCell><TableCell>Routed to</TableCell></TableRow></TableHead>
        <TableBody>
          {[...runs.data].reverse().map((r) => (
            <TableRow key={r.id} hover>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.startedAt}</TableCell>
              <TableCell>{r.requestedBy}<Typography variant="caption" component="div">{r.role}</Typography></TableCell>
              <TableCell>{r.contextIds.join(', ') || 'Whole portfolio'}<Typography variant="caption" component="div">{r.period}</Typography></TableCell>
              <TableCell>{r.question}</TableCell>
              <TableCell><Chip label={r.state} size="small" color={STATE_COLOR[r.state]} variant="outlined" /></TableCell>
              <TableCell>{r.routedTo ? `${r.routedTo}${r.findingId ? ` as ${r.findingId}` : ''}` : 'Not routed'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
