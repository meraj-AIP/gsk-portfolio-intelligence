import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useSnapshots } from '@/shared/api/hooks';
import { LoadingState } from '@/shared/components/StatePanels';
import { formatDate } from '@/shared/lib/format';
import type { Definition } from '@/shared/types/domain';

/** Every version in force over time, then which of them each closed review was assessed under. */
export function DefinitionHistory({ def }: { def: Definition }) {
  const snapshots = useSnapshots();
  const versions = [...(def.history ?? []), { version: def.version, value: def.value, owner: def.owner, effectiveDate: def.effectiveDate, reason: def.reason }].reverse();
  const closed = (snapshots.data ?? []).filter((s) => s.status !== 'open');

  return (
    <Stack sx={{ gap: 1.5 }}>
      <div>
        <Typography variant="caption">Version history</Typography>
        <Table size="small">
          <TableHead><TableRow><TableCell>Version</TableCell><TableCell>Value</TableCell><TableCell>Owner</TableCell><TableCell>Effective</TableCell><TableCell>Reason</TableCell></TableRow></TableHead>
          <TableBody>
            {versions.map((v) => (
              <TableRow key={v.version}>
                <TableCell>v{v.version}{v.version === def.version ? ' (current)' : ''}</TableCell>
                <TableCell>{v.value}</TableCell>
                <TableCell>{v.owner}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(v.effectiveDate)}</TableCell>
                <TableCell>{v.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div>
        <Typography variant="caption">Version used by each closed review</Typography>
        {snapshots.isError ? <Typography variant="body2">Reviews could not be loaded.</Typography> : !snapshots.data ? <LoadingState rows={2} />
          : closed.length === 0 ? <Typography variant="body2">No review has been closed yet.</Typography> : (
            <Stack sx={{ mt: 0.5 }}>
              {closed.map((s) => {
                const used = s.content?.definitionVersions[def.id];
                return <Typography key={s.id} variant="body2">{s.label}: {used ? `v${used}` : 'not recorded when this review closed'}</Typography>;
              })}
            </Stack>
          )}
      </div>
    </Stack>
  );
}
