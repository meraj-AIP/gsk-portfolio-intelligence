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
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip, type Tone } from '@/shared/components/ui/StatusChip';
import { sentence } from './directoryModel';

const STATUS_TONE: Record<TechnicalIssue['status'], Tone> = { open: 'warning', mitigated: 'info', resolved: 'success' };
const SEVERITY_TONE: Record<TechnicalIssue['severity'], Tone> = { high: 'danger', medium: 'warning', low: 'neutral' };

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
              <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{i.title}</Typography><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{i.id}</Typography></TableCell>
              <TableCell><StatusChip tone={SEVERITY_TONE[i.severity]} dot={false}>{sentence(i.severity)}</StatusChip></TableCell>
              <TableCell><StatusChip tone={STATUS_TONE[i.status]} dot={false}>{sentence(i.status)}</StatusChip></TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(i.raised)}</TableCell>
              <TableCell><AvatarName name={i.owner} size={24} /></TableCell>
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
