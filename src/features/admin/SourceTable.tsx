import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { RowTitle } from '@/shared/components/ui/MatrixCard';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import type { Source } from '@/shared/types/domain';
import { RetryIngestionButton } from './RetryIngestionButton';
import { HEALTH, issueKind, issueStatus, KIND_LABEL, QUALITY } from './sourceIssues';

type Props = { sources: Source[]; selectedIssueId: string; onSelect: (issueId: string) => void };

const capitalise = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

/** Connection health and content quality stay in separate columns; a healthy feed can still carry bad content. */
export function SourceTable({ sources, selectedIssueId, onSelect }: Props) {
  return (
    <Table sx={{ minWidth: 1040 }}>
      <TableHead><TableRow><TableCell>Source</TableCell><TableCell>Owner</TableCell><TableCell>Authoritative for</TableCell><TableCell>Cadence</TableCell><TableCell>Last refresh</TableCell><TableCell>Connection</TableCell><TableCell>Content</TableCell><TableCell>Issues</TableCell></TableRow></TableHead>
      <TableBody>
        {sources.map((s) => (
          <TableRow key={s.id} hover>
            <TableCell sx={{ minWidth: 220, maxWidth: 260 }}><RowTitle title={s.name} meta={`${s.id}, ${s.supplies}`} /></TableCell>
            <TableCell sx={{ maxWidth: 200 }}><AvatarName name={s.owner} size={24} /></TableCell>
            <TableCell sx={{ maxWidth: 200 }}><Typography variant="caption" sx={{ color: 'text.primary' }}>{s.authoritativeFields.join(', ')}</Typography></TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{s.cadence}</TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(s.lastRefresh)}<Typography variant="caption" component="div">{s.lastRefresh.split(' ')[1] ?? ''}</Typography></TableCell>
            <TableCell><StatusChip tone={HEALTH[s.connectionHealth]}>{capitalise(s.connectionHealth)}</StatusChip></TableCell>
            <TableCell><StatusChip tone={QUALITY[s.contentQuality]}>{capitalise(s.contentQuality)}</StatusChip></TableCell>
            <TableCell>
              <Stack sx={{ gap: 0.5, alignItems: 'flex-start' }}>
                {s.issues.length === 0 ? <Typography variant="caption">None</Typography> : null}
                {s.issues.map((i) => (
                  <Button key={i.id} variant={i.id === selectedIssueId ? 'contained' : 'outlined'} aria-pressed={i.id === selectedIssueId} onClick={() => onSelect(i.id)} sx={{ justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    {i.id}: {KIND_LABEL[issueKind(i)]}, {issueStatus(i)}
                  </Button>
                ))}
                <RetryIngestionButton source={s} />
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
