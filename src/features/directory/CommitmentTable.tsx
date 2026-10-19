import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { Commitment } from '@/shared/types/domain';
import { EntityLink } from '@/shared/components/EntityLink';
import { formatDate } from '@/shared/lib/format';

/** Same facts as the timeline chart, readable by screen readers and without pointer hover. */
export function CommitmentTable({ commitments }: { commitments: Commitment[] }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead><TableRow><TableCell>Commitment</TableCell><TableCell>Owner</TableCell><TableCell>Original</TableCell><TableCell>Current</TableCell><TableCell>Actual</TableCell><TableCell>Status</TableCell><TableCell>Evidence</TableCell></TableRow></TableHead>
        <TableBody>
          {commitments.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.title}</TableCell>
              <TableCell>{c.owner}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(c.baselineDate)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{c.currentDate === c.baselineDate ? 'Unchanged' : formatDate(c.currentDate)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{c.actualDate ? formatDate(c.actualDate) : 'Not yet'}</TableCell>
              <TableCell>{c.status}</TableCell>
              <TableCell><EntityLink id={c.evidenceId} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
