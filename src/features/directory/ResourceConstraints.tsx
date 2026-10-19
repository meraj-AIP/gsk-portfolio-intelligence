import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useResourceConstraints } from '@/shared/api/hooks';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { formatDate } from '@/shared/lib/format';
import type { Commitment } from '@/shared/types/domain';

/** Missing people or skills that put a named commitment at risk. */
export function ResourceConstraints({ projectId, commitments }: { projectId: string; commitments: Commitment[] }) {
  const constraints = useResourceConstraints();
  if (constraints.isError) return <ErrorState message="Resource constraints could not be loaded." onRetry={() => void constraints.refetch()} />;
  if (constraints.isLoading) return <LoadingState rows={2} />;
  const rows = (constraints.data ?? []).filter((r) => r.projectId === projectId);
  if (!rows.length) return <EmptyState title="No resource constraints recorded" />;
  const title = (id: string) => commitments.find((c) => c.id === id)?.title ?? id;
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead><TableRow><TableCell>Team or skill needed</TableCell><TableCell>Affected commitment</TableCell><TableCell>Responsible owner</TableCell><TableCell>Needed by</TableCell><TableCell>Status</TableCell><TableCell>Note</TableCell></TableRow></TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.requiredTeamOrSkill}</TableCell>
              <TableCell>{title(r.affectedCommitmentId)}</TableCell>
              <TableCell>{r.responsibleOwner}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(r.neededBy)}</TableCell>
              <TableCell><Typography variant="caption" sx={{ color: r.status === 'open' ? 'condition.attention' : 'text.secondary', fontWeight: r.status === 'open' ? 700 : 400 }}>{r.status}</Typography></TableCell>
              <TableCell sx={{ maxWidth: 260 }}><Typography variant="caption">{r.note}</Typography></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
