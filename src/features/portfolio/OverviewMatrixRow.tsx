import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { ProgressLine } from '@/shared/components/ui/Controls';
import { DomainTag, StatusChip } from '@/shared/components/ui/StatusChip';
import type { Project } from '@/shared/types/domain';
import { allGatesPassed, lifecyclePercent, riskOf, worstOf } from './OverviewModel';
import { usePanelHref } from './OverviewLinks';

/** Gate summary for the governance column: all passed, or the first gate still open and its status. */
export function gateSummary(p: Project): string {
  const open = p.gates.find((g) => g.status !== 'passed');
  if (open) return `${open.name} ${open.status}`;
  return p.gates.length ? `All ${p.gates.length} gates passed` : 'No gates recorded';
}

export function OverviewMatrixRow({ project: p, programme }: { project: Project; programme: string }) {
  const href = usePanelHref();
  const risk = riskOf(p);
  const worst = worstOf(p);
  const passed = allGatesPassed(p);
  const tone = worst === 'breached' || worst === 'attention' ? 'accent' : p.stage === 'Live' || p.stage === 'Scaling' ? 'success' : 'navy';
  return (
    <TableRow hover>
      <TableCell sx={{ minWidth: 200 }}>
        <Link component={RouterLink} to={`/projects/${p.id}`} variant="body2" underline="hover" sx={{ fontWeight: 600, color: 'primary.main' }}>{p.name}</Link>
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'text.secondary' }}>{p.id}</Typography>
      </TableCell>
      <TableCell><DomainTag>{programme}</DomainTag></TableCell>
      <TableCell><AvatarName name={p.owner} size={24} /></TableCell>
      <TableCell sx={{ minWidth: 150 }}><ProgressLine caption={`${p.stage} (${lifecyclePercent(p)}%)`} value={lifecyclePercent(p)} tone={tone} /></TableCell>
      <TableCell><StatusChip tone={risk.tone} dot={false}>{risk.label}</StatusChip></TableCell>
      <TableCell>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
          {passed ? <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} /> : <HourglassEmptyIcon sx={{ fontSize: 16, color: 'warning.main' }} />}
          <Typography variant="body2">{gateSummary(p)}</Typography>
        </Stack>
      </TableCell>
      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
        <Tooltip title="Open project"><IconButton size="small" component={RouterLink} to={`/projects/${p.id}`} aria-label={`Open ${p.name}`}><OpenInNewIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Ask about this"><IconButton size="small" component={RouterLink} to={href({ ask: p.id })} aria-label={`Ask about ${p.name}`}><QuestionAnswerOutlinedIcon fontSize="small" /></IconButton></Tooltip>
      </TableCell>
    </TableRow>
  );
}
