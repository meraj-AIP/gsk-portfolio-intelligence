import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useSnapshots } from '@/shared/api/hooks';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import type { Definition } from '@/shared/types/domain';

/** Every version in force over time, then which of them each closed review was assessed under. */
export function DefinitionHistory({ def }: { def: Definition }) {
  const snapshots = useSnapshots();
  const versions = [...(def.history ?? []), { version: def.version, value: def.value, owner: def.owner, effectiveDate: def.effectiveDate, reason: def.reason }].reverse();
  const closed = (snapshots.data ?? []).filter((s) => s.status !== 'open');

  return (
    <Stack sx={{ gap: 2 }}>
      <Box sx={(t) => ({ overflowX: 'auto', border: `1px solid ${t.palette.divider}`, borderRadius: 1 })}>
        <Table sx={{ minWidth: 560 }}>
          <TableHead><TableRow><TableCell>Version</TableCell><TableCell>Value</TableCell><TableCell>Owner</TableCell><TableCell>Effective</TableCell><TableCell>Reason</TableCell></TableRow></TableHead>
          <TableBody>
            {versions.map((v) => (
              <TableRow key={v.version}>
                <TableCell><StatusChip tone={v.version === def.version ? 'info' : 'neutral'} square dot={false}>v{v.version}{v.version === def.version ? ' current' : ''}</StatusChip></TableCell>
                <TableCell>{v.value}</TableCell>
                <TableCell><AvatarName name={v.owner} size={24} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(v.effectiveDate)}</TableCell>
                <TableCell>{v.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Box>
        <Typography variant="overline" component="p" sx={{ mb: 0.75 }}>Version used by each closed review</Typography>
        {snapshots.isError ? <ErrorState message="Reviews could not be loaded." onRetry={() => void snapshots.refetch()} /> : !snapshots.data ? <LoadingState rows={2} />
          : closed.length === 0 ? <Typography variant="body2">No review has been closed yet.</Typography> : (
            <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
              {closed.map((s) => {
                const used = s.content?.definitionVersions[def.id];
                return <StatusChip key={s.id} tone={used ? 'neutral' : 'warning'} dot={false}>{s.label}: {used ? `v${used}` : 'not recorded'}</StatusChip>;
              })}
            </Stack>
          )}
      </Box>
    </Stack>
  );
}
