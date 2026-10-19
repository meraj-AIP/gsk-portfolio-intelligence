import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { RUN_TONE } from '@/features/ask/InvestigationResultCard';
import { MatrixCard, MatrixMessage, RowTitle } from '@/shared/components/ui/MatrixCard';
import { useInvestigations } from '@/shared/api/hooks';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip } from '@/shared/components/ui/StatusChip';

/** Every investigation run with who asked and where it went. Answers are interpretation, so only the question is listed. */
export function InvestigationRuns() {
  const runs = useInvestigations();
  const body = runs.isError ? <MatrixMessage><ErrorState message="Investigation runs could not be loaded." onRetry={() => void runs.refetch()} /></MatrixMessage>
    : !runs.data ? <MatrixMessage><LoadingState rows={3} /></MatrixMessage>
      : runs.data.length === 0 ? <MatrixMessage><EmptyState title="No investigation runs yet" hint="Questions asked in Ask the portfolio during this session appear here with their outcome." /></MatrixMessage>
        : (
          <Table sx={{ minWidth: 860 }}>
            <TableHead><TableRow><TableCell>Question</TableCell><TableCell>Started</TableCell><TableCell>Who</TableCell><TableCell>Scope</TableCell><TableCell>State</TableCell><TableCell>Routed to</TableCell></TableRow></TableHead>
            <TableBody>
              {[...runs.data].reverse().map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ maxWidth: 320 }}><RowTitle title={r.question} meta={r.id} /></TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.startedAt}</TableCell>
                  <TableCell><AvatarName name={r.requestedBy} subtitle={r.role} size={24} /></TableCell>
                  <TableCell>{r.contextIds.join(', ') || 'Whole portfolio'}<Typography variant="caption" component="div">{r.period}</Typography></TableCell>
                  <TableCell><StatusChip tone={RUN_TONE[r.state]}>{r.state}</StatusChip></TableCell>
                  <TableCell>{r.routedTo ? `${r.routedTo}${r.findingId ? ` as ${r.findingId}` : ''}` : 'Not routed'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );
  return <MatrixCard title="Investigation runs" subtitle="Questions asked in Ask the portfolio, who asked them and where the answer went.">{body}</MatrixCard>;
}
