import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useFindingPage, useLifecycles } from '@/shared/api/hooks';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { ProgressLine } from '@/shared/components/ui/Controls';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { formatDate } from '@/shared/lib/format';
import { LIFECYCLE } from '@/shared/lib/journey';
import type { Finding } from '@/shared/types/domain';
import { MatrixCard, MatrixMessage, RowTitle } from './MatrixCard';
import { Aging, Pager, capitalise, useListParams } from './viewState';

const awaiting = (f: Finding) => f.responses.every((r) => r.findingVersion !== f.version);

/** Lifecycle position as the reference stage progress rule: share of the five lifecycle stages reached. */
function Stage({ id }: { id: string }) {
  const lifecycles = useLifecycles();
  if (lifecycles.isError) return <Typography variant="caption">Not available</Typography>;
  const stage = lifecycles.data?.[id]?.stage;
  if (!stage) return null;
  const at = LIFECYCLE.indexOf(stage) + 1;
  return <ProgressLine caption={`${capitalise(stage)} (${at} of ${LIFECYCLE.length})`} value={(at / LIFECYCLE.length) * 100} tone={stage === 'resolved' ? 'success' : 'navy'} />;
}

function Rows({ rows }: { rows: Finding[] }) {
  const [, openFinding] = useUrlParam('finding');
  return (
    <Table sx={{ minWidth: 900 }}>
      <TableHead><TableRow><TableCell>Finding</TableCell><TableCell>Requested owner</TableCell><TableCell>Due</TableCell><TableCell>Aging</TableCell><TableCell>Response</TableCell><TableCell>Lifecycle stage</TableCell><TableCell align="right">Journey</TableCell></TableRow></TableHead>
      <TableBody>
        {rows.map((f) => {
          const open = awaiting(f);
          return (
            <TableRow key={f.id} hover>
              <TableCell sx={{ maxWidth: 320 }}><RowTitle title={f.title} meta={`${f.id}, version ${f.version}`} /></TableCell>
              <TableCell>{f.requestedOwner ? <AvatarName name={f.requestedOwner} size={24} /> : 'Not requested'}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{f.dueDate ? formatDate(f.dueDate) : 'Not set'}</TableCell>
              <TableCell>{f.requestedOwner ? <Aging dueDate={f.dueDate} closed={!open} /> : null}</TableCell>
              <TableCell><StatusChip tone={open ? 'warning' : 'success'}>{open ? 'Awaiting response' : 'Responded'}</StatusChip></TableCell>
              <TableCell><Stage id={f.id} /></TableCell>
              <TableCell align="right"><Button variant="outlined" onClick={() => openFinding(f.id)}>Open journey</Button></TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/** Findings routed to an owner. A response against an older version still counts as outstanding, because the evidence moved. */
export function ResponsesView() {
  const { mine, params, setPage } = useListParams();
  const query = useFindingPage({ ...params, awaiting: true });
  const data = query.data;
  return (
    <MatrixCard title="Responses required" subtitle="Findings routed to a named owner with no response against the current version." footer={data?.total ? <Pager data={data} onPage={setPage} noun="findings" /> : undefined}>
      {query.isError ? <MatrixMessage><ErrorState message={query.error.message} onRetry={() => void query.refetch()} /></MatrixMessage>
        : !data ? <MatrixMessage><LoadingState rows={5} /></MatrixMessage>
          : data.items.length ? <Rows rows={data.items} />
            : <MatrixMessage><EmptyState title={mine ? 'No responses requested from you' : 'No findings in this scope'} hint={mine ? 'Switch to everyone to see the whole portfolio.' : undefined} /></MatrixMessage>}
    </MatrixCard>
  );
}
