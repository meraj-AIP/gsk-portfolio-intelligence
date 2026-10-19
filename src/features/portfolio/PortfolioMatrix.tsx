import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Fragment, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import type { Finding, Programme, Project } from '@/shared/types/domain';
import { DIMENSIONS } from '@/shared/types/domain';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { DIM_HELP, DIM_LABEL, programmeReason, worstCondition } from './matrixConfig';
import { OverviewContribution } from './OverviewContribution';
import { usePanelHref } from './OverviewLinks';
import { OverviewProjectRow, STICKY } from './OverviewProjectRow';

type Props = {
  programmes: Programme[];
  projects: Project[];
  findings: Finding[];
  onOpenFinding: (id: string) => void;
  /** Condition each changed cell had in the comparison review, keyed by cellKey. */
  was: Map<string, string>;
  comparisonWeek: string;
  /** Kept so existing callers still compile; the matrix now always groups by programme. */
  grouping?: 'programme' | 'businessArea';
};

const COLS = DIMENSIONS.length + 1;

/** Position matrix. Programmes start collapsed with their worst condition and why; expanding shows contribution and projects. */
export function PortfolioMatrix({ programmes, projects, findings, onOpenFinding, was, comparisonWeek }: Props) {
  const href = usePanelHref();
  // A single programme (for example on its own page) has nothing to scan past, so it opens straight away.
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => (programmes.length === 1 && programmes[0] ? { [programmes[0].id]: true } : {}));

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 560 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...STICKY, minWidth: { xs: 160, sm: 260 } }}>Programme and projects</TableCell>
            {DIMENSIONS.map((d) => (
              <TableCell key={d} align="center">
                <Tooltip title={DIM_HELP[d]}>
                  {d === 'dependencies'
                    ? <Link component={RouterLink} to={href({ tab: 'constraints' })} underline="hover" sx={{ fontWeight: 700 }}>{DIM_LABEL[d]}</Link>
                    : <span>{DIM_LABEL[d]}</span>}
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {programmes.map((pg) => {
            const own = projects.filter((p) => p.programmeId === pg.id);
            if (!own.length) return null;
            const open = expanded[pg.id] ?? false;
            return (
              <Fragment key={pg.id}>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell colSpan={COLS} sx={{ py: 1 }}>
                    <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
                      <ButtonBase onClick={() => setExpanded((s) => ({ ...s, [pg.id]: !open }))} aria-expanded={open} aria-label={`${open ? 'Collapse' : 'Expand'} ${pg.name}`} sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', textAlign: 'left', borderRadius: 0.5, gap: 1 }}>
                        <ExpandMoreIcon fontSize="small" sx={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 120ms', color: 'text.secondary', mt: 0.25 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1">{pg.name}</Typography>
                            <ConditionChip condition={worstCondition(own)} compact />
                          </Stack>
                          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>{own.length} projects. {programmeReason(own)}</Typography>
                        </Box>
                      </ButtonBase>
                      <Tooltip title="Ask about this programme">
                        <IconButton size="small" component={RouterLink} to={href({ ask: pg.id })} aria-label={`Ask about ${pg.name}`}><QuestionAnswerOutlinedIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Stack>
                    {open ? (
                      <Box sx={{ pl: { xs: 0, sm: 4 }, pt: 1, maxWidth: 820 }}>
                        <OverviewContribution programmeId={pg.id} />
                        <Link component={RouterLink} to={`/programmes/${pg.id}`} variant="caption">Programme detail</Link>
                      </Box>
                    ) : null}
                  </TableCell>
                </TableRow>
                {open ? own.map((p) => (
                  <OverviewProjectRow key={p.id} project={p} findings={findings} was={was} comparisonWeek={comparisonWeek} onOpenFinding={onOpenFinding} />
                )) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
