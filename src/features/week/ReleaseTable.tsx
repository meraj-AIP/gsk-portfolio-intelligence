import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { KeyboardEvent } from 'react';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import type { Programme, Project, Release, ReleaseEvent } from '@/shared/types/domain';

export const EVENT_LABEL: Record<ReleaseEvent['kind'], string> = {
  planned: 'Planned release',
  deployed: 'Observed deployment',
  available: 'Business availability',
  expanded: 'Expanded rollout',
  withdrawn: 'Withdrawal or rollback',
};

type Props = { rows: { r: Release; pg: Programme }[]; projects: Project[]; selectedId: string | null; onSelect: (id: string) => void };

const dates = (r: Release, kind: ReleaseEvent['kind']) => r.events.filter((e) => e.kind === kind).map((e) => formatDate(e.date)).join(', ') || 'None';

/** The same events as the timeline, readable by screen reader and keyboard. Each row selects its release. */
export function ReleaseTable({ rows, projects, selectedId, onSelect }: Props) {
  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); }
  };
  return (
    <TableContainer sx={{ maxHeight: 520, border: 1, borderColor: 'divider', borderRadius: 2, '& td': { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } }}>
      <Table size="small" stickyHeader aria-label="Releases with planned, deployed, available, expanded and withdrawn dates">
        <TableHead>
          <TableRow>
            <TableCell>Release</TableCell>
            <TableCell>Programme and project</TableCell>
            {(['planned', 'deployed', 'available', 'expanded', 'withdrawn'] as const).map((k) => <TableCell key={k}>{EVENT_LABEL[k]}</TableCell>)}
            <TableCell>Outstanding conditions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(({ r, pg }) => (
            <TableRow key={r.id} hover selected={r.id === selectedId} aria-selected={r.id === selectedId} tabIndex={0} onClick={() => onSelect(r.id)} onKeyDown={(e) => onKey(e, r.id)} sx={{ cursor: 'pointer', '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineStyle: 'solid', outlineOffset: -2 } }}>
              <TableCell component="th" scope="row" sx={{ fontWeight: 600, color: 'primary.main' }}>{r.capability}</TableCell>
              <TableCell>{pg.name}, {projects.find((p) => p.id === r.projectId)?.name ?? r.projectId}</TableCell>
              <TableCell>{dates(r, 'planned')}</TableCell>
              <TableCell>{dates(r, 'deployed')}</TableCell>
              <TableCell>{dates(r, 'available')}</TableCell>
              <TableCell>{dates(r, 'expanded')}</TableCell>
              <TableCell>{dates(r, 'withdrawn')}</TableCell>
              <TableCell>{r.outstandingConditions.length ? <StatusChip tone="warning" dot={false}>{r.outstandingConditions.length} open</StatusChip> : <Typography variant="caption" sx={{ color: 'text.secondary' }}>None</Typography>}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
