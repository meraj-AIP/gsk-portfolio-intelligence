import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useActions, useDecisionPage } from '@/shared/api/hooks';
import { EntityLink } from '@/shared/components/EntityLink';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import type { Decision } from '@/shared/types/domain';
import { MatrixCard, MatrixMessage, RowTitle } from '@/shared/components/ui/MatrixCard';
import { ACTION_TONE, Pager, useListParams } from './viewState';

/** Each linked action shows its live status, so a decision that led nowhere is visible. */
function LinkedActions({ ids }: { ids: string[] }) {
  const actions = useActions();
  if (!ids.length) return <Typography variant="caption">No action linked</Typography>;
  return (
    <Stack sx={{ gap: 0.5, alignItems: 'flex-start' }}>
      {ids.map((id) => {
        const act = actions.data?.find((x) => x.id === id);
        const label = act?.status ?? (actions.isLoading ? 'loading' : 'unknown');
        return <StatusChip key={id} tone={act ? ACTION_TONE[act.status] : 'neutral'} title={act?.title}>{id}: {label}</StatusChip>;
      })}
    </Stack>
  );
}

function Rows({ rows }: { rows: Decision[] }) {
  return (
    <Table sx={{ minWidth: 1000 }}>
      <TableHead><TableRow><TableCell>Decision</TableCell><TableCell>Conclusion</TableCell><TableCell>Decision maker</TableCell><TableCell>Conditions</TableCell><TableCell>Authoritative reference</TableCell><TableCell>Led to</TableCell></TableRow></TableHead>
      <TableBody>
        {rows.map((d) => (
          <TableRow key={d.id} hover>
            <TableCell sx={{ maxWidth: 260 }}>
              <RowTitle title={d.question} meta={<>{d.id}{d.findingId ? <>, from <EntityLink id={d.findingId} label={`${d.findingId} (open journey)`} /></> : null}</>} />
            </TableCell>
            <TableCell sx={{ maxWidth: 280 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{d.conclusion}</Typography></TableCell>
            <TableCell><AvatarName name={d.decisionMaker} subtitle={formatDate(d.date)} size={24} /></TableCell>
            <TableCell sx={{ maxWidth: 220 }}>{d.conditions || 'None'}</TableCell>
            <TableCell>{d.reference ? <EntityLink id={d.reference} /> : 'Not given'}</TableCell>
            <TableCell><LinkedActions ids={d.actionIds} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** Decisions belong to the whole review scope, so the "mine" filter does not narrow them. */
export function DecisionsView() {
  const { params, setPage } = useListParams();
  const query = useDecisionPage({ page: params.page, pageSize: params.pageSize, scope: params.scope });
  const data = query.data;
  return (
    <MatrixCard title="Decisions" subtitle="Funding and deployment decisions with their authoritative references. Execution stays within the relevant approval and integration scope."
      footer={data?.total ? <Pager data={data} onPage={setPage} noun="decisions" /> : undefined}>
      {query.isError ? <MatrixMessage><ErrorState message={query.error.message} onRetry={() => void query.refetch()} /></MatrixMessage>
        : !data ? <MatrixMessage><LoadingState rows={5} /></MatrixMessage>
          : data.items.length ? <Rows rows={data.items} />
            : <MatrixMessage><EmptyState title="No decisions recorded in this scope" /></MatrixMessage>}
    </MatrixCard>
  );
}
