import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { EmptyState } from '@/shared/components/StatePanels';
import { EntityLink } from '@/shared/components/EntityLink';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import type { Release } from '@/shared/types/domain';
import { EVENT_LABEL } from './ReleaseTable';

const FIELDS: { label: string; value: (r: Release) => string }[] = [
  { label: 'Capability delivered', value: (r) => r.capability },
  { label: 'Business capability', value: (r) => r.businessCapability },
  { label: 'Availability events', value: (r) => r.events.map((e) => `${EVENT_LABEL[e.kind]} ${formatDate(e.date)}`).join('; ') || 'None' },
  { label: 'Planned date', value: (r) => r.events.filter((e) => e.kind === 'planned').map((e) => formatDate(e.date)).join(', then ') || 'None' },
  { label: 'Business availability date', value: (r) => { const a = r.events.find((e) => e.kind === 'available'); return a ? formatDate(a.date) : 'Not yet available'; } },
  { label: 'Enabled teams', value: (r) => r.enabledTeams.join(', ') || 'None' },
  { label: 'Outstanding conditions', value: (r) => r.outstandingConditions.join('; ') || 'None' },
  { label: 'Adoption', value: (r) => (r.adoption ? `${r.adoption.activeUsers} active users, ${r.adoption.period}${r.adoption.early ? ' (early evidence)' : ''}` : 'No adoption evidence recorded') },
];

type Props = { release: Release; previous: Release | undefined; isLoading: boolean; isError: boolean };

/** Field by field as recorded by the release owners. Nothing here is calculated beyond marking which fields differ. */
export function ReleaseComparison({ release, previous, isLoading, isError }: Props) {
  if (!release.previousReleaseId) return <EmptyState title="No previous release recorded" hint="This release is not linked to an earlier one, so there is nothing to compare." />;
  if (isError) return <Typography variant="body2" sx={{ color: 'error.main' }}>The previous release could not be loaded.</Typography>;
  if (isLoading) return <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading the previous release.</Typography>;
  if (!previous) return <EmptyState title="Previous release not found" hint={`This release refers to ${release.previousReleaseId}, but that record is not in the workspace.`} />;
  return (
    <>
      <Typography variant="body2" sx={{ mb: 1 }}>{release.changesFromPrevious}</Typography>
      <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small" aria-label="Field by field comparison with the previous release">
          <TableHead>
            <TableRow>
              <TableCell>Field</TableCell>
              <TableCell>This release</TableCell>
              <TableCell>Previous: <EntityLink id={previous.id} label={previous.capability} /></TableCell>
              <TableCell>Difference</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {FIELDS.map((f) => {
              const now = f.value(release);
              const before = f.value(previous);
              return (
                <TableRow key={f.label}>
                  <TableCell component="th" scope="row">{f.label}</TableCell>
                  <TableCell>{now}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{before}</TableCell>
                  <TableCell>{now === before ? <Typography variant="caption" sx={{ color: 'text.secondary' }}>Same</Typography> : <StatusChip tone="warning" dot={false}>Changed</StatusChip>}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
