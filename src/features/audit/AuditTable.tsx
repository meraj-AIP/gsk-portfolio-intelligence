import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { useSearchParams } from 'react-router-dom';
import { useAuditPage } from '@/shared/api/hooks';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { AUDIT_KINDS } from './auditKinds';
import { AuditRow } from './AuditRow';

const SIZES = [10, 25, 50];

/** Paginated change log. Page, size, kind and search live in the URL so a filtered view can be shared. */
export function AuditTable() {
  const [params, setParams] = useSearchParams();
  // One write per change: a filter edit and its page reset must land together, which two useUrlParam calls cannot guarantee.
  const update = (patch: Record<string, string | null>) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    return next;
  }, { replace: true });
  const q = params.get('q') ?? '';
  const kind = params.get('kind') ?? '';
  const page = Math.max(0, Number(params.get('page')) || 0);
  const pageSize = SIZES.includes(Number(params.get('size'))) ? Number(params.get('size')) : SIZES[0]!;
  const audit = useAuditPage({ page, pageSize, ...(q ? { q } : {}), ...(kind ? { kind } : {}) });
  const filtered = Boolean(q || kind);

  return (
    <Stack sx={{ gap: 1.5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1 }}>
        <TextField size="small" label="Search summary, user or record" value={q} onChange={(e) => update({ q: e.target.value, page: null })} sx={{ flex: 1 }} />
        <TextField size="small" select label="Change" value={kind} onChange={(e) => update({ kind: e.target.value, page: null })} sx={{ minWidth: 220 }}>
          <MenuItem value="">All changes</MenuItem>
          {AUDIT_KINDS.map((k) => <MenuItem key={k} value={k}>{k}</MenuItem>)}
        </TextField>
      </Stack>
      {audit.isError ? <ErrorState message="The audit trail could not be loaded." onRetry={() => void audit.refetch()} />
        : !audit.data ? <LoadingState rows={6} />
          : audit.data.total === 0 ? (
            <EmptyState title={filtered ? 'No changes match these filters' : 'No changes recorded yet'}
              hint={filtered ? 'Clear the search or change filter to see more.' : 'Changes made in this session, such as responses, decisions, briefing edits and definition changes, appear here as they happen.'} />
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 1000 }}>
                <TableHead>
                  <TableRow><TableCell>Time</TableCell><TableCell>User</TableCell><TableCell>Role</TableCell><TableCell>Change</TableCell><TableCell>Record</TableCell><TableCell>Summary</TableCell><TableCell>Evidence version</TableCell><TableCell>Inputs</TableCell></TableRow>
                </TableHead>
                <TableBody>{audit.data.items.map((e) => <AuditRow key={e.id} entry={e} />)}</TableBody>
              </Table>
              <TablePagination component="div" count={audit.data.total} page={audit.data.page} rowsPerPage={audit.data.pageSize} rowsPerPageOptions={SIZES}
                labelDisplayedRows={({ from, to, count }) => `${from} to ${to} of ${count}`}
                onPageChange={(_, n) => update({ page: n ? String(n) : null })} onRowsPerPageChange={(e) => update({ size: e.target.value, page: null })} />
            </Box>
          )}
    </Stack>
  );
}
