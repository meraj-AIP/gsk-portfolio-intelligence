import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { KIND_SINGULAR, type ScopedConstraint } from './ConstraintModel';

type Props = { constraints: ScopedConstraint[]; selectedId: string | null; onSelect: (id: string) => void };

const NUM = { fontVariantNumeric: 'tabular-nums', textAlign: 'right' } as const;

/** One row per constraint, worst first as the API sorts them. Every row selects its trace by mouse or keyboard. */
export function ConstraintList({ constraints, selectedId, onSelect }: Props) {
  return (
    <TableContainer sx={{ mx: { xs: -2, md: -2.5 }, width: 'auto' }}>
      <Table size="small" aria-label="Shared constraints">
        <TableHead>
          <TableRow>
            <TableCell>Constraint</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell sx={NUM}>Projects</TableCell>
            <TableCell sx={NUM}>Programmes</TableCell>
            <TableCell sx={NUM}>Findings</TableCell>
            <TableCell>Worst position</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {constraints.map((c) => {
            const sel = c.node.id === selectedId;
            return (
              <TableRow key={c.node.id} hover selected={sel} aria-selected={sel} tabIndex={0} onClick={() => onSelect(c.node.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(c.node.id); } }}
                sx={(t) => ({
                  cursor: 'pointer', '&.Mui-selected, &.Mui-selected:hover': { bgcolor: alpha(t.palette.brand.accent, 0.06) },
                  '&.Mui-selected td:first-of-type': { boxShadow: `inset 3px 0 0 ${t.palette.brand.accent}` },
                  '&:focus-visible': { outline: `2px solid ${t.palette.brand.accent}`, outlineOffset: -2 },
                })}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{c.node.label}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{KIND_SINGULAR[c.node.kind]}</Typography>
                </TableCell>
                <TableCell>{c.node.owner ? <AvatarName name={c.node.owner} size={24} /> : <Typography variant="caption" sx={{ color: 'text.secondary' }}>Not recorded</Typography>}</TableCell>
                <TableCell sx={NUM}>{c.inScopeProjectIds.length}</TableCell>
                <TableCell sx={NUM}>{c.inScopeProgrammeIds.length}</TableCell>
                <TableCell sx={NUM}>{c.findingIds.length}</TableCell>
                <TableCell><ConditionChip condition={c.worst} /></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
