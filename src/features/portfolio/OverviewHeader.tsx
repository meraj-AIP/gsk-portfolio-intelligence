import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useReview } from '@/app/context/ReviewContext';
import { useAllProjects, useProgrammes } from '@/shared/api/hooks';
import { FilterChips, SegmentedToggle } from '@/shared/components/ui/Controls';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { useOverviewParams, type OverviewMode } from './OverviewParams';

const ALL = 'All programmes';
const MODES = [
  { value: 'board', label: 'Board', icon: <DashboardOutlinedIcon /> },
  { value: 'matrix', label: 'Matrix', icon: <TableChartOutlinedIcon /> },
  { value: 'stage', label: 'Stage-gate', icon: <AccountTreeOutlinedIcon /> },
];

/** Review status and cycle, read from the viewed snapshot. */
export function OverviewEyebrow() {
  const { viewSnapshot } = useReview();
  const week = Number(viewSnapshot?.week.split('-W')[1] ?? 0);
  return (
    <>
      {viewSnapshot?.status === 'open' ? <StatusChip tone="success">Review open</StatusChip> : <StatusChip tone="neutral">Closed review</StatusChip>}
      {week ? <Typography variant="label" sx={{ color: 'text.secondary' }}>Week {week} review cycle</Typography> : null}
    </>
  );
}

export function OverviewActions() {
  const { view, patch } = useOverviewParams();
  return (
    <>
      <SegmentedToggle label="Overview layout" options={MODES} value={view} onChange={(v) => patch({ view: (v as OverviewMode) === 'board' ? null : v })} />
      <Button variant="outlined" component={RouterLink} to="/briefing" startIcon={<DescriptionOutlinedIcon />}>Executive briefing</Button>
      <Button variant="contained" color="secondary" component={RouterLink} to="/this-week" startIcon={<TuneIcon />}>Open weekly review</Button>
    </>
  );
}

/** Programme filter bound to the review scope, so every other screen follows the same choice. */
export function OverviewMeta() {
  const { scope, setScope, comparisonSnapshot } = useReview();
  const { patch } = useOverviewParams();
  const programmes = useProgrammes().data ?? [];
  const projects = useAllProjects().data ?? [];
  const options = [
    { value: ALL, label: 'All programmes', count: projects.length },
    ...programmes.map((p) => ({ value: p.id, label: p.name, count: projects.filter((x) => x.programmeId === p.id).length })),
  ];
  const reset = () => {
    setScope({ portfolio: ALL });
    patch({ stage: null, mq: null, mpage: null });
  };
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 1.5 }}>
      <FilterChips label="Filter by programme" options={options} value={scope.portfolio} onChange={(v) => { setScope({ portfolio: v }); patch({ mpage: null, stage: null }); }} />
      <Stack direction="row" sx={{ alignItems: 'center', gap: 2, flexShrink: 0 }}>
        {comparisonSnapshot ? <Typography variant="label" sx={{ color: 'text.secondary' }}>Baseline: {comparisonSnapshot.label}</Typography> : null}
        <Button variant="text" color="secondary" size="small" onClick={reset}>Reset filters</Button>
      </Stack>
    </Stack>
  );
}
