import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useTechnicalIssues } from '@/shared/api/hooks';
import { EntityLink } from '@/shared/components/EntityLink';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { formatDate } from '@/shared/lib/format';
import type { TechnicalIssue } from '@/shared/types/workflow';

const SEVERITY_COLOUR: Record<TechnicalIssue['severity'], string> = { high: 'condition.breached', medium: 'condition.attention', low: 'text.secondary' };

/** Technical issues are their own delivery records, raised by the project, not inferred from dependencies. */
export function TechnicalIssues({ projectId }: { projectId: string }) {
  const issues = useTechnicalIssues();
  if (issues.isError) return <ErrorState message="Technical issues could not be loaded." onRetry={() => void issues.refetch()} />;
  if (issues.isLoading) return <LoadingState rows={2} />;
  const rows = (issues.data ?? []).filter((i) => i.projectId === projectId);
  if (!rows.length) return <EmptyState title="No technical issues recorded" />;
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 760 }}>
        <TableHead><TableRow><TableCell>Issue</TableCell><TableCell>Severity</TableCell><TableCell>Status</TableCell><TableCell>Raised</TableCell><TableCell>Owner</TableCell><TableCell>Affected commitments</TableCell><TableCell>Effect on delivery</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {rows.map((i) => (
            <TableRow key={i.id}>
              <TableCell><Typography variant="body2">{i.title}</Typography><Typography variant="caption">{i.id}</Typography></TableCell>
              <TableCell><Typography variant="caption" sx={{ color: SEVERITY_COLOUR[i.severity], fontWeight: 700 }}>{i.severity}</Typography></TableCell>
              <TableCell>{i.status}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(i.raised)}</TableCell>
              <TableCell>{i.owner}</TableCell>
              <TableCell>{i.affectedCommitmentIds.join(', ') || 'None'}</TableCell>
              <TableCell sx={{ maxWidth: 260 }}><Typography variant="caption" sx={{ color: 'text.primary' }}>{i.deliveryEffect}</Typography></TableCell>
              <TableCell><EntityLink id={i.evidenceId} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
