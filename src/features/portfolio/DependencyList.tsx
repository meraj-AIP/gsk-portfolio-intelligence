import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useDependencyPage } from '@/shared/api/hooks';
import type { GraphNode } from '@/shared/types/domain';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { formatDate } from '@/shared/lib/format';

const PAGE_SIZE = 10;

type Props = { query: { scope: string; owner: string; type: string; before?: string }; nodes: GraphNode[]; selectedId: string | null; onSelect: (id: string) => void };

/** Accessible alternative to the graph: the same relationships as a table, paged by the server. */
export function DependencyList({ query, nodes, selectedId, onSelect }: Props) {
  const [pageParam, setPage] = useUrlParam('page');
  const page = Math.max(0, Number(pageParam) || 0);
  const result = useDependencyPage({ page, pageSize: PAGE_SIZE, scope: query.scope, ...(query.owner ? { owner: query.owner } : {}), ...(query.type ? { type: query.type } : {}), ...(query.before ? { requiredBefore: query.before } : {}) });
  const label = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;

  if (result.isError) return <ErrorState message="Relationships could not be loaded." onRetry={() => void result.refetch()} />;
  if (!result.data) return <LoadingState rows={6} />;
  if (!result.data.items.length) return <EmptyState title="No relationships match the filters" hint="Clear a filter or choose a wider portfolio." />;
  return (
    <>
      <Table size="small" aria-busy={result.isFetching}>
        <TableHead>
          <TableRow><TableCell>From</TableCell><TableCell>Relationship</TableCell><TableCell>To</TableCell><TableCell>Owner</TableCell><TableCell>Required</TableCell><TableCell>Position</TableCell></TableRow>
        </TableHead>
        <TableBody>
          {result.data.items.map((d) => (
            <TableRow key={d.id} hover selected={d.id === selectedId} onClick={() => onSelect(d.id)} sx={{ cursor: 'pointer' }} tabIndex={0} aria-selected={d.id === selectedId}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(d.id); } }}>
              <TableCell>{label(d.fromId)}</TableCell>
              <TableCell>{d.type}{d.reuseCandidate ? ' (reuse candidate)' : ''}</TableCell>
              <TableCell>{label(d.toId)}</TableCell>
              <TableCell>{d.owner}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(d.requiredDate)}</TableCell>
              <TableCell><ConditionChip condition={d.position} compact /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination component="div" count={result.data.total} page={page} rowsPerPage={PAGE_SIZE} rowsPerPageOptions={[PAGE_SIZE]} onPageChange={(_, p) => setPage(p ? String(p) : null)} />
    </>
  );
}
