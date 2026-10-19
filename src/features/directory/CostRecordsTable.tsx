import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { formatDate, gbp } from '@/shared/lib/format';
import { can } from '@/shared/lib/permissions';
import type { CostRecord } from '@/shared/types/domain';
import { CostRecordDialog, type CostAction } from './CostRecordDialog';

const num = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as const;

/** Reported cost records with Finance sign-off. Only Finance sees the action buttons; others see who confirmed and when. */
export function CostRecordsTable({ records }: { records: CostRecord[] }) {
  const { user } = useAuth();
  const [open, setOpen] = useState<{ record: CostRecord; action: CostAction } | null>(null);
  const canConfirm = can(user, 'confirm allocation');
  const canReconcile = can(user, 'reconcile cost');
  if (!records.length) return <Typography variant="body2" sx={{ color: 'text.secondary' }}>No cost records reported.</Typography>;
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 760 }}>
        <TableHead><TableRow><TableCell>Record</TableCell><TableCell>Kind, period</TableCell><TableCell align="right">Amount</TableCell><TableCell>Allocation basis</TableCell><TableCell>Reconciliation</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {records.map((r) => {
            const shared = r.allocationBasis !== 'Direct';
            return (
              <TableRow key={r.id}>
                <TableCell><Typography variant="body2">{r.id}</Typography><Typography variant="caption">{r.projectId}, funded by {r.fundedBy}</Typography></TableCell>
                <TableCell><Typography variant="caption" sx={{ color: 'text.primary' }}>{r.kind}, {r.period}</Typography></TableCell>
                <TableCell align="right" sx={num}>{gbp(r.amount)}</TableCell>
                <TableCell sx={{ maxWidth: 240 }}>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.primary' }}>{r.allocationBasis}</Typography>
                  {shared ? <Typography variant="caption" sx={{ color: r.allocationConfirmed ? 'text.secondary' : 'condition.attention' }}>{r.allocationConfirmed ? `Confirmed by ${r.allocationConfirmed.by}, ${formatDate(r.allocationConfirmed.date)}` : 'Shared, basis not confirmed'}</Typography> : null}
                </TableCell>
                <TableCell sx={{ maxWidth: 240 }}><Typography variant="caption">{r.reconciliation ? `${r.reconciliation.by}, ${formatDate(r.reconciliation.date)}. ${r.reconciliation.note}` : 'Not reconciled'}</Typography></TableCell>
                <TableCell>
                  <Stack direction="row" sx={{ gap: 0.5, justifyContent: 'flex-end' }}>
                    {shared && canConfirm ? <Button size="small" onClick={() => setOpen({ record: r, action: 'confirm' })}>Confirm basis</Button> : null}
                    {canReconcile ? <Button size="small" onClick={() => setOpen({ record: r, action: 'reconcile' })}>Reconcile</Button> : null}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {!canConfirm && !canReconcile ? <Typography variant="caption">Confirming allocation and reconciling cost records is done by Finance.</Typography> : null}
      {open ? <CostRecordDialog key={`${open.record.id}-${open.action}`} record={open.record} action={open.action} onClose={() => setOpen(null)} /> : null}
    </Box>
  );
}
