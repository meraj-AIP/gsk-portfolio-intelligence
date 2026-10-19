import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { Source } from '@/shared/types/domain';
import { RetryIngestionButton } from './RetryIngestionButton';
import { HEALTH, issueKind, issueStatus, KIND_LABEL, QUALITY } from './sourceIssues';

type Props = { sources: Source[]; selectedIssueId: string; onSelect: (issueId: string) => void };

/** Connection health and content quality stay in separate columns; a healthy feed can still carry bad content. */
export function SourceTable({ sources, selectedIssueId, onSelect }: Props) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 900 }}>
        <TableHead><TableRow><TableCell>Source</TableCell><TableCell>Owner</TableCell><TableCell>Authoritative for</TableCell><TableCell>Cadence</TableCell><TableCell>Last refresh</TableCell><TableCell>Connection</TableCell><TableCell>Content</TableCell><TableCell>Issues</TableCell></TableRow></TableHead>
        <TableBody>
          {sources.map((s) => (
            <TableRow key={s.id} hover>
              <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography><Typography variant="caption">{s.supplies}</Typography></TableCell>
              <TableCell>{s.owner}</TableCell>
              <TableCell><Typography variant="caption" sx={{ color: 'text.primary' }}>{s.authoritativeFields.join(', ')}</Typography></TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{s.cadence}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{s.lastRefresh}</TableCell>
              <TableCell><Chip label={s.connectionHealth} color={HEALTH[s.connectionHealth]} variant="outlined" /></TableCell>
              <TableCell><Chip label={s.contentQuality} color={QUALITY[s.contentQuality]} variant="outlined" /></TableCell>
              <TableCell>
                <Stack sx={{ gap: 0.5 }}>
                  {s.issues.length === 0 ? <Typography variant="caption">None</Typography> : null}
                  {s.issues.map((i) => (
                    <Button key={i.id} size="small" variant={i.id === selectedIssueId ? 'contained' : 'outlined'} onClick={() => onSelect(i.id)} sx={{ justifyContent: 'flex-start', textAlign: 'left' }}>
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
    </Box>
  );
}
