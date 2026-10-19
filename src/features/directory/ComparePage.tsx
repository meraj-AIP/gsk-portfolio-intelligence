import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useReview } from '@/app/context/ReviewContext';
import { useAllProjects, useCostRecords, useOutcomeMeasures, useReleases } from '@/shared/api/hooks';
import { projectIdsInScope } from '@/shared/api/listApi';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { EntityLink } from '@/shared/components/EntityLink';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { gbp } from '@/shared/lib/format';
import { costSummary } from '@/shared/lib/portfolio';
import type { Project } from '@/shared/types/domain';

type Focus = 'delivery' | 'releases' | 'cost' | 'outcomes';
type Row = { label: string; cell: (p: Project) => ReactNode; numeric?: boolean };

/** Comparison tray. Preserves differences in scope, period and definitions; incompatible measures are shown apart with an explanation. */
export function ComparePage() {
  const [sp] = useSearchParams();
  const { scope } = useReview();
  const picked = (sp.get('ids') ?? '').split(',').filter(Boolean);
  const [focusRaw, setFocus] = useUrlParam('focus');
  const focus = (focusRaw || 'delivery') as Focus;
  // Finance lands here with nothing selected, so cost defaults to the whole scope rather than an empty page.
  const scopeDefault = picked.length === 0 && focus === 'cost';
  const ids = scopeDefault ? projectIdsInScope(scope.portfolio) : picked;
  const projects = useAllProjects();
  const costs = useCostRecords();
  const outcomes = useOutcomeMeasures();
  const releases = useReleases();
  if (projects.isError || costs.isError || outcomes.isError || releases.isError) return <ErrorState message="Comparison data could not be loaded." onRetry={() => { void projects.refetch(); void costs.refetch(); void outcomes.refetch(); void releases.refetch(); }} />;
  if (!projects.data || !costs.data || !outcomes.data || !releases.data) return <LoadingState rows={6} />;
  const rows = projects.data.filter((p) => ids.includes(p.id));
  if (rows.length < 2) return <EmptyState title="Select at least two projects to compare" hint="Use the checkboxes in the directory." />;

  const byFocus: Record<Focus, Row[]> = {
    delivery: [
      { label: 'Delivery position', cell: (p) => <ConditionChip condition={p.position.delivery} compact /> },
      { label: 'Current commitment', cell: (p) => p.commitment.label },
      { label: 'Original date', cell: (p) => p.commitment.original },
      { label: 'Current date', cell: (p) => p.commitment.current },
      { label: 'Actual', cell: (p) => p.commitment.actual ?? 'Not yet' },
      { label: 'Stage', cell: (p) => p.stage },
      { label: 'Governance gates', cell: (p) => p.gates.map((g) => `${g.name}: ${g.status}`).join('; ') },
    ],
    releases: [
      { label: 'Release position', cell: (p) => <ConditionChip condition={p.position.releases} compact /> },
      { label: 'Releases recorded', cell: (p) => String(releases.data!.filter((r) => r.projectId === p.id).length), numeric: true },
      { label: 'Available to the business', cell: (p) => releases.data!.filter((r) => r.projectId === p.id && r.events.some((e) => e.kind === 'available')).map((r) => r.capability).join('; ') || 'None yet' },
      { label: 'Outstanding conditions', cell: (p) => releases.data!.filter((r) => r.projectId === p.id).flatMap((r) => r.outstandingConditions).join('; ') || 'None' },
    ],
    cost: [
      { label: 'Cost position', cell: (p) => <ConditionChip condition={p.position.cost} compact /> },
      { label: 'Budget (FY26, GBP, direct)', cell: (p) => gbp(costSummary(costs.data!, [p.id]).budget), numeric: true },
      { label: 'Actual to date', cell: (p) => gbp(costSummary(costs.data!, [p.id]).actual), numeric: true },
      { label: 'Forecast', cell: (p) => gbp(costSummary(costs.data!, [p.id]).forecast), numeric: true },
      { label: 'Variance', cell: (p) => { const c = costSummary(costs.data!, [p.id]); return `${c.variance >= 0 ? '+' : ''}${gbp(c.variance)}`; }, numeric: true },
      { label: 'Shared allocation (excluded)', cell: (p) => { const c = costSummary(costs.data!, [p.id]); return c.sharedExcluded ? `${gbp(c.sharedExcluded)}, basis not agreed` : 'None'; }, numeric: true },
      { label: 'Funded by', cell: (p) => p.funding.map((f) => `${f.businessUnit} ${f.percent}%`).join('; ') },
    ],
    outcomes: [
      { label: 'Outcome position', cell: (p) => <ConditionChip condition={p.position.outcomes} compact /> },
      { label: 'Measured outcomes', cell: (p) => outcomes.data!.filter((o) => o.projectId === p.id && o.actual).map((o) => `${o.name}: ${o.actual} (${o.period})`).join('; ') || 'None measured' },
      { label: 'Forecast benefits', cell: (p) => outcomes.data!.filter((o) => o.projectId === p.id && !o.actual).map((o) => `${o.name}: ${o.forecast}, ${o.period}`).join('; ') || 'None defined' },
      { label: 'Definitions differ', cell: (p) => outcomes.data!.filter((o) => o.projectId === p.id).map((o) => o.definition).join(' / ') || 'No measure defined' },
    ],
  };

  return (
    <>
      <PageHeader title="Compare projects" subtitle="Side-by-side evidence to support judgement. This view does not rank projects for investment. Measures with different definitions, periods or populations are shown separately with their definition."
        actions={<Button component={RouterLink} to="/directory" variant="outlined">Back to directory</Button>}
        meta={<ToggleButtonGroup size="small" exclusive value={focus} onChange={(_, v: Focus | null) => v && setFocus(v)}><ToggleButton value="delivery">Delivery</ToggleButton><ToggleButton value="releases">Releases</ToggleButton><ToggleButton value="cost">Cost</ToggleButton><ToggleButton value="outcomes">Outcomes</ToggleButton></ToggleButtonGroup>} />
      {scopeDefault ? <Alert severity="info" sx={{ mb: 2 }}>No projects were selected, so this shows every project in {scope.portfolio === 'All programmes' ? 'the portfolio' : 'the selected programme'}. Pick projects in the directory to narrow it.</Alert> : null}
      {focus === 'outcomes' ? <Alert severity="info" sx={{ mb: 2 }}>Outcome measures use different definitions and periods per project. They are listed, not compared numerically.</Alert> : null}
      <SectionCard title={`${focus.charAt(0).toUpperCase() + focus.slice(1)} comparison`} dense>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 700 }}>
            <TableHead><TableRow><TableCell /> {rows.map((p) => <TableCell key={p.id}><EntityLink id={p.id} label={p.name} /><Typography variant="caption" sx={{ display: 'block' }}>{p.owner}</Typography></TableCell>)}</TableRow></TableHead>
            <TableBody>{byFocus[focus].map((r) => <TableRow key={r.label}><TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{r.label}</TableCell>{rows.map((p) => <TableCell key={p.id} align={r.numeric ? 'right' : 'left'} sx={r.numeric ? { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } : undefined}>{r.cell(p)}</TableCell>)}</TableRow>)}</TableBody>
          </Table>
        </Box>
        <Stack direction="row" sx={{ mt: 1 }}><Typography variant="caption">Currency GBP; period FY26 year to date; definitions per DEF-06 and DEF-07.</Typography></Stack>
      </SectionCard>
    </>
  );
}
