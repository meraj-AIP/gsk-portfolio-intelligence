import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { Amendment } from '@/shared/types/workflow';
import { formatDate } from '@/shared/lib/format';

/** Corrections recorded against a closed review. They are reported facts about the record, not recalculations. */
export function AmendmentList({ amendments }: { amendments: Amendment[] }) {
  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Amendments to this review ({amendments.length})</Typography>
      <Table size="small">
        <TableHead><TableRow><TableCell>Date</TableCell><TableCell>By</TableCell><TableCell>Record</TableCell><TableCell>Correction</TableCell><TableCell>Reason</TableCell></TableRow></TableHead>
        <TableBody>
          {amendments.map((a) => (
            <TableRow key={a.id}>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(a.date)}</TableCell>
              <TableCell>{a.by}</TableCell>
              <TableCell>{a.recordId}</TableCell>
              <TableCell>{a.correction}</TableCell>
              <TableCell>{a.reason}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
