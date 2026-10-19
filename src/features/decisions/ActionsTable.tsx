import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/features/auth/AuthContext';
import { useSnapshots } from '@/shared/api/hooks';
import type { Action } from '@/shared/types/domain';
import { EntityLink } from '@/shared/components/EntityLink';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import { can } from '@/shared/lib/permissions';
import { RowTitle } from '@/shared/components/ui/MatrixCard';
import { ACTION_TONE, Aging, capitalise } from './viewState';

type Props = { actions: Action[]; onUpdate: (a: Action) => void };

/** Overdue and persistent items stand out (overdue after due date; persistent if carried from an earlier week). */
export function ActionsTable({ actions, onUpdate }: Props) {
  const { user } = useAuth();
  const openWeek = useSnapshots().data?.find((s) => s.status === 'open')?.week;
  const blockedReason = (a: Action) =>
    a.owner === user?.name || user?.role === 'Portfolio lead' || can(user, 'verify completion') ? null : 'Only the owner or the portfolio lead can update this action.';
  return (
    <Table sx={{ minWidth: 960 }}>
      <TableHead><TableRow><TableCell>Action</TableCell><TableCell>Owner</TableCell><TableCell>Due</TableCell><TableCell>Aging</TableCell><TableCell>Status</TableCell><TableCell>Blocker or evidence</TableCell><TableCell align="right">Update</TableCell></TableRow></TableHead>
      <TableBody>
        {actions.map((a) => {
          const closed = a.status === 'verified complete';
          const reason = blockedReason(a);
          return (
            <TableRow key={a.id} hover>
              <TableCell sx={{ maxWidth: 320 }}>
                <RowTitle title={a.title} meta={<>{a.id}{a.findingId ? <>, from <EntityLink id={a.findingId} label={`${a.findingId} (open journey)`} /></> : null}</>} />
              </TableCell>
              <TableCell><AvatarName name={a.owner} size={24} /></TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(a.dueDate)}</TableCell>
              <TableCell>
                <Stack sx={{ gap: 0.5, alignItems: 'flex-start' }}>
                  <Aging openedOn={a.history[0]?.date} dueDate={a.dueDate} closed={closed} />
                  {!closed && openWeek && a.createdWeek < openWeek ? <StatusChip tone="warning" dot={false}>Carried from {a.createdWeek.replace('2026-', '')}</StatusChip> : null}
                </Stack>
              </TableCell>
              <TableCell><StatusChip tone={ACTION_TONE[a.status]}>{capitalise(a.status)}</StatusChip></TableCell>
              <TableCell sx={{ maxWidth: 260 }}><Typography variant="caption" sx={{ color: 'text.primary' }}>{a.blocker || a.completionEvidence || (a.history[a.history.length - 1]?.note ?? '')}</Typography></TableCell>
              <TableCell align="right">
                <Tooltip title={reason ?? ''}><span><Button variant="text" disabled={Boolean(reason)} onClick={() => onUpdate(a)}>Update</Button></span></Tooltip>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
