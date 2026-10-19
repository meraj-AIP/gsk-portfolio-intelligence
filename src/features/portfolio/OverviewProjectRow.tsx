import Link from '@mui/material/Link';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import type { Condition, Dimension, Finding, Project } from '@/shared/types/domain';
import { DIMENSIONS } from '@/shared/types/domain';
import { MatrixCell } from './MatrixCell';
import { DIM_CATEGORY, DIM_LABEL } from './matrixConfig';
import { cellKey } from './usePortfolioView';

export const STICKY = { position: 'sticky', left: 0, zIndex: 1, bgcolor: 'background.paper' } as const;

type Props = { project: Project; findings: Finding[]; was: Map<string, string>; comparisonWeek: string; onOpenFinding: (id: string) => void };

const RANK: Record<Condition, number> = { breached: 2, attention: 1, unknown: 0, reported: 0, met: 0 };

/** The first worst exception in the row keeps its fill; any other exception is quiet, so a row carries one coloured marker. */
function colouredDimension(project: Project): Dimension | undefined {
  const top = Math.max(...DIMENSIONS.map((d) => RANK[project.position[d]]));
  return top ? DIMENSIONS.find((d) => RANK[project.position[d]] === top) : undefined;
}

export function OverviewProjectRow({ project: p, findings, was, comparisonWeek, onOpenFinding }: Props) {
  const navigate = useNavigate();
  const coloured = colouredDimension(p);
  const due = p.commitment.actual ? `done ${p.commitment.actual}` : `due ${p.commitment.current}`;
  return (
    <TableRow hover>
      <TableCell sx={{ ...STICKY, pl: { xs: 1.5, sm: 4 } }}>
        <Link component={RouterLink} to={`/projects/${p.id}`} variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Link>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          {p.owner}. {p.commitment.label}, {due}{p.freshness !== 'current' ? `. Update ${p.freshness}` : ''}
        </Typography>
      </TableCell>
      {DIMENSIONS.map((d) => {
        const finding = findings.find((f) => f.affectedIds.includes(p.id) && DIM_CATEGORY[d].includes(f.category));
        return (
          <TableCell key={d} align="center">
            <MatrixCell
              condition={p.position[d]}
              quiet={coloured !== d}
              label={`${p.name} ${DIM_LABEL[d]}: ${p.position[d]}. ${finding ? 'Opens finding' : 'Opens project summary'}`}
              was={was.get(cellKey(p.id, d))}
              comparisonWeek={comparisonWeek}
              onClick={finding ? () => onOpenFinding(finding.id) : () => navigate(`/projects/${p.id}`)}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
}
