import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { Commitment } from '@/shared/types/domain';
import { EntityLink } from '@/shared/components/EntityLink';
import { formatDate } from '@/shared/lib/format';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip, type Tone } from '@/shared/components/ui/StatusChip';
import { sentence } from './directoryModel';

const TONE: Record<Commitment['status'], Tone> = { completed: 'success', 'on track': 'info', revised: 'warning', late: 'danger', 'carried forward': 'warning' };

/** Same facts as the timeline chart, readable by screen readers and without pointer hover. */
export function CommitmentTable({ commitments }: { commitments: Commitment[] }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead><TableRow><TableCell>Commitment</TableCell><TableCell>Owner</TableCell><TableCell>Original</TableCell><TableCell>Current</TableCell><TableCell>Actual</TableCell><TableCell>Status</TableCell><TableCell>Evidence</TableCell></TableRow></TableHead>
        <TableBody>
          {commitments.map((c) => (
            <TableRow key={c.id}>
              <TableCell sx={{ fontWeight: 600 }}>{c.title}</TableCell>
              <TableCell><AvatarName name={c.owner} size={24} /></TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(c.baselineDate)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{c.currentDate === c.baselineDate ? 'Unchanged' : formatDate(c.currentDate)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{c.actualDate ? formatDate(c.actualDate) : 'Not yet'}</TableCell>
              <TableCell><StatusChip tone={TONE[c.status]} dot={false}>{sentence(c.status)}</StatusChip></TableCell>
              <TableCell><EntityLink id={c.evidenceId} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
