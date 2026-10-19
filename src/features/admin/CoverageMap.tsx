import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import type { Source } from '@/shared/types/domain';

const AREAS = ['Identity and ownership', 'Commitments and scope', 'Releases and availability', 'Expenditure and forecast', 'Adoption and outcomes', 'Governance', 'Dependencies'];

const COVERS: Record<string, string[]> = {
  'SRC-01': ['Identity and ownership', 'Commitments and scope'],
  'SRC-02': ['Commitments and scope'],
  'SRC-03': ['Expenditure and forecast'],
  'SRC-04': ['Releases and availability'],
  'SRC-05': ['Governance'],
  'SRC-06': ['Dependencies'],
  'SRC-07': ['Adoption and outcomes'],
};

/** Which sources support which portfolio information. Gaps show as empty cells; covered but imperfect content shows as partial. */
export function CoverageMap({ sources }: { sources: Source[] }) {
  return (
    <Box>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 860 }}>
          <TableHead><TableRow><TableCell>Source</TableCell>{AREAS.map((a) => <TableCell key={a} align="center" sx={{ whiteSpace: 'normal' }}>{a}</TableCell>)}</TableRow></TableHead>
          <TableBody>
            {sources.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{s.name}</TableCell>
                {AREAS.map((a) => {
                  const covered = (COVERS[s.id] ?? []).includes(a);
                  const weak = covered && s.contentQuality !== 'good';
                  return <TableCell key={a} align="center">{covered ? <StatusChip tone={weak ? 'warning' : 'success'} dot={false}>{weak ? 'Partial' : 'Covered'}</StatusChip> : null}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Typography variant="caption" component="p" sx={{ px: 2.5, py: 1.5 }}>Dependencies are inferred from plans and the model registry; there is no dedicated dependency source yet.</Typography>
    </Box>
  );
}
