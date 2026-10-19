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
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip } from '@/shared/components/ui/StatusChip';

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
                <TableCell><AvatarName name={r.owner} size={24} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{planned ? formatDate(planned.date) : 'n/a'}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{withdrawn ? <StatusChip tone="danger" dot={false}>Withdrawn {formatDate(withdrawn.date)}</StatusChip> : avail ? <StatusChip tone="success">{formatDate(avail.date)}</StatusChip> : <StatusChip tone="neutral" dot={false}>Not yet</StatusChip>}</TableCell>
                <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{r.adoption ? `${r.adoption.activeUsers} active, ${r.adoption.period}${r.adoption.early ? ' (early)' : ''}` : 'No evidence'}</TableCell>
                <TableCell>{r.outstandingConditions.join('; ') || 'None'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
