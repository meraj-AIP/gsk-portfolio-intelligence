import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import type { DirectoryParams } from '@/shared/api/readApi';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { Freshness } from '@/shared/components/Freshness';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { ProgressLine } from '@/shared/components/ui/Controls';
import { DomainTag } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import type { Finding, Page, Programme, Project } from '@/shared/types/domain';
import { gateSummary, riskLabel, stageStep, worstOf } from './directoryModel';

type Props = {
  page: Page<Project>; loading: boolean; programmes: Programme[]; findings: Finding[]; params: DirectoryParams;
  onParams: (p: Partial<DirectoryParams>) => void; selected: string[]; onToggle: (id: string) => void; onOpen: (id: string) => void;
};

const SORTABLE: Partial<Record<DirectoryParams['sort'], string>> = { name: 'Project and ID', owner: 'Owner', commitment: 'Current commitment' };
const sortHead = (key: DirectoryParams['sort'], params: DirectoryParams, onParams: Props['onParams']) => (
  <TableSortLabel active={params.sort === key} direction="asc" onClick={() => onParams({ sort: key })}>{SORTABLE[key]}</TableSortLabel>
);

/** Reference "active portfolio matrix": one row per project from the server page, nothing counted twice. */
export function DirectoryMatrix({ page, loading, programmes, findings, params, onParams, selected, onToggle, onOpen }: Props) {
  const [, openFinding] = useUrlParam('finding');
  return (
    <Box sx={{ overflowX: 'auto', opacity: loading ? 0.6 : 1 }}>
      <Table sx={{ minWidth: 1080 }}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell>{sortHead('name', params, onParams)}</TableCell>
            <TableCell>Programme</TableCell>
            <TableCell>{sortHead('owner', params, onParams)}</TableCell>
            <TableCell>Lifecycle stage</TableCell>
            <TableCell>Risk</TableCell>
            <TableCell>Governance</TableCell>
            <TableCell>{sortHead('commitment', params, onParams)}</TableCell>
            <TableCell>Follow-up</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {page.items.map((p) => {
            const step = stageStep(p.stage);
            const gates = gateSummary(p.gates);
            const finding = findings.find((f) => f.affectedIds.includes(p.id));
            return (
              <TableRow key={p.id} hover selected={selected.includes(p.id)}>
                <TableCell padding="checkbox"><Checkbox checked={selected.includes(p.id)} onChange={() => onToggle(p.id)} slotProps={{ input: { 'aria-label': `Select ${p.name} for comparison` } }} /></TableCell>
                <TableCell sx={{ maxWidth: 240 }}>
                  <Link component="button" type="button" variant="body2" sx={{ fontWeight: 600, textAlign: 'left', color: 'primary.main' }} onClick={() => onOpen(p.id)}>{p.name}</Link>
                  <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', fontFamily: 'monospace' }}>{p.id}</Typography>
                </TableCell>
                <TableCell><DomainTag>{programmes.find((x) => x.id === p.programmeId)?.name ?? p.programmeId}</DomainTag></TableCell>
                <TableCell><AvatarName name={p.owner} size={24} /></TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  <ProgressLine caption={step.step ? `${p.stage} (${step.step} of ${step.of})` : p.stage} value={step.percent} tone={p.stage === 'Live' || p.stage === 'Scaling' ? 'success' : 'navy'} />
                </TableCell>
                <TableCell><ConditionChip condition={worstOf(p.position).condition} label={riskLabel(p)} /></TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>{gates.passed} of {gates.total} passed</Typography>
                  {gates.next ? <Typography sx={{ fontSize: '0.6875rem', color: gates.next.status === 'returned' ? 'condition.breached' : 'text.secondary' }}>{gates.next.name}: {gates.next.status}</Typography> : null}
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2">{p.commitment.label}</Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>{p.commitment.actual ? `Done ${formatDate(p.commitment.actual)}` : `Due ${formatDate(p.commitment.current)}`}</Typography>
                  <Freshness reportingDate={p.reportingDate} freshness={p.freshness} />
                </TableCell>
                <TableCell sx={{ maxWidth: 240 }}>
                  {finding ? <Link component="button" type="button" variant="caption" sx={{ textAlign: 'left', display: 'block' }} onClick={() => openFinding(finding.id)}>{finding.title}</Link> : <Typography variant="caption">No material finding</Typography>}
                  {p.outstandingResponse ? <Typography variant="caption" sx={{ display: 'block', color: 'condition.attention', fontWeight: 700 }}>Awaiting: {p.outstandingResponse}</Typography> : null}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="Open summary"><IconButton size="small" aria-label={`Open summary for ${p.name}`} onClick={() => onOpen(p.id)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Open full record"><IconButton size="small" component={RouterLink} to={`/projects/${p.id}`} aria-label={`Open ${p.name}`}><OpenInNewIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
