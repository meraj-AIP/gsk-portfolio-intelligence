import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useClarificationPage } from '@/shared/api/hooks';
import { EntityLink } from '@/shared/components/EntityLink';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import type { Clarification } from '@/shared/types/workflow';
import { AnswerClarificationDialog } from './AnswerClarificationDialog';
import { MatrixCard, MatrixMessage, RowTitle } from '@/shared/components/ui/MatrixCard';
import { Aging, Pager, useListParams } from './viewState';

function Rows({ rows, me, onAnswer }: { rows: Clarification[]; me: string; onAnswer: (c: Clarification) => void }) {
  return (
    <Table sx={{ minWidth: 960 }}>
      <TableHead><TableRow><TableCell>Question</TableCell><TableCell>Owner</TableCell><TableCell>Asked by</TableCell><TableCell>Due</TableCell><TableCell>Aging</TableCell><TableCell>Answer</TableCell><TableCell align="right">Respond</TableCell></TableRow></TableHead>
      <TableBody>
        {rows.map((c) => (
          <TableRow key={c.id} hover>
            <TableCell sx={{ maxWidth: 300 }}><RowTitle title={c.question} meta={<>{c.id} about <EntityLink id={c.targetId} /></>} /></TableCell>
            <TableCell><AvatarName name={c.owner} size={24} /></TableCell>
            <TableCell><AvatarName name={c.requestedBy} subtitle={formatDate(c.requestedOn)} size={24} /></TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(c.dueDate)}</TableCell>
            <TableCell><Aging openedOn={c.requestedOn} dueDate={c.dueDate} closed={c.status === 'answered'} /></TableCell>
            <TableCell sx={{ maxWidth: 260 }}>
              {c.answer ? <Typography variant="body2">{c.answer}{c.answeredOn ? ` (${formatDate(c.answeredOn)})` : ''}</Typography> : <StatusChip tone="warning">Awaiting answer</StatusChip>}
            </TableCell>
            <TableCell align="right">{c.status === 'open' && c.owner === me ? <Button variant="outlined" onClick={() => onAnswer(c)}>Answer</Button> : null}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** Questions put to named owners. Only the person asked can answer, which the write API enforces too. */
export function ClarificationsView() {
  const { mine, me, params, setPage } = useListParams();
  const query = useClarificationPage(params);
  const [answering, setAnswering] = useState<Clarification | null>(null);
  const data = query.data;
  return (
    <MatrixCard title="Clarifications" subtitle="Questions put to named owners. Only the person asked can answer." footer={data?.total ? <Pager data={data} onPage={setPage} noun="requests" /> : undefined}>
      {query.isError ? <MatrixMessage><ErrorState message={query.error.message} onRetry={() => void query.refetch()} /></MatrixMessage>
        : !data ? <MatrixMessage><LoadingState rows={5} /></MatrixMessage>
          : data.items.length ? <Rows rows={data.items} me={me} onAnswer={setAnswering} />
            : <MatrixMessage><EmptyState title={mine ? 'No clarifications asked of you' : 'No clarification requests'} hint={mine ? 'Switch to everyone to see all requests.' : undefined} /></MatrixMessage>}
      {answering ? <AnswerClarificationDialog key={answering.id} request={answering} onClose={() => setAnswering(null)} /> : null}
    </MatrixCard>
  );
}
