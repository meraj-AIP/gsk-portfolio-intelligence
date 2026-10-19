import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { Release } from '@/shared/types/domain';
import { EntityLink } from '@/shared/components/EntityLink';
import { EmptyState } from '@/shared/components/StatePanels';
import { formatDate } from '@/shared/lib/format';

export function ReleaseRows({ releases }: { releases: Release[] }) {
  if (!releases.length) return <EmptyState title="No releases recorded" />;
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 700 }}>
        <TableHead><TableRow><TableCell>Capability</TableCell><TableCell>Owner</TableCell><TableCell>Planned</TableCell><TableCell>Available</TableCell><TableCell>Adoption</TableCell><TableCell>Follow-up</TableCell></TableRow></TableHead>
        <TableBody>
          {releases.map((r) => {
            const planned = r.events.find((e) => e.kind === 'planned');
            const avail = r.events.find((e) => e.kind === 'available');
            const withdrawn = r.events.find((e) => e.kind === 'withdrawn');
            return (
              <TableRow key={r.id} hover>
                <TableCell><EntityLink id={r.id} label={r.capability} /></TableCell>
                <TableCell>{r.owner}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{planned ? formatDate(planned.date) : 'n/a'}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{withdrawn ? `Withdrawn ${formatDate(withdrawn.date)}` : avail ? formatDate(avail.date) : 'Not yet'}</TableCell>
                <TableCell>{r.adoption ? `${r.adoption.activeUsers} active, ${r.adoption.period}${r.adoption.early ? ' (early)' : ''}` : 'No evidence'}</TableCell>
                <TableCell>{r.outstandingConditions.join('; ') || 'None'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
