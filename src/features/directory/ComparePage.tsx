import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useReview } from '@/app/context/ReviewContext';
import { useAllProjects, useCostRecords, useOutcomeMeasures, useProgrammes, useReleases } from '@/shared/api/hooks';
import { projectIdsInScope } from '@/shared/api/listApi';
import { EntityLink } from '@/shared/components/EntityLink';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { SegmentedToggle } from '@/shared/components/ui/Controls';
import { DomainTag } from '@/shared/components/ui/StatusChip';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { compareRows, type Focus } from './compareRows';
import { CompareSummary } from './CompareSummary';
import { sentence } from './directoryModel';

const FOCUSES: { value: Focus; label: string }[] = [{ value: 'delivery', label: 'Delivery' }, { value: 'releases', label: 'Releases' }, { value: 'cost', label: 'Cost' }, { value: 'outcomes', label: 'Outcomes' }];

/** Comparison tray. Preserves differences in scope, period and definitions; incompatible measures are shown apart with an explanation. */
export function ComparePage() {
  const [sp] = useSearchParams();
  const { scope } = useReview();
  const picked = (sp.get('ids') ?? '').split(',').filter(Boolean);
  const [focusRaw, setFocus] = useUrlParam('focus');
  const focus: Focus = FOCUSES.some((f) => f.value === focusRaw) ? (focusRaw as Focus) : 'delivery';
  // Finance lands here with nothing selected, so cost defaults to the whole scope rather than an empty page.
  const scopeDefault = picked.length === 0 && focus === 'cost';
  const ids = scopeDefault ? projectIdsInScope(scope.portfolio) : picked;
  const projects = useAllProjects();
  const programmes = useProgrammes();
  const costs = useCostRecords();
  const outcomes = useOutcomeMeasures();
  const releases = useReleases();

  const header = (
    <PageHeader eyebrow={<Typography variant="overline">{ids.length} project{ids.length === 1 ? '' : 's'} in this comparison</Typography>}
      title="Compare projects" subtitle="Side-by-side evidence to support judgement. This view does not rank projects for investment. Measures with different definitions, periods or populations are shown separately with their definition."
      actions={<>
        <SegmentedToggle label="Comparison focus" options={FOCUSES} value={focus} onChange={(v) => setFocus(v === 'delivery' ? null : v)} />
        <Button component={RouterLink} to="/directory" variant="outlined">Back to directory</Button>
      </>} />
  );
  const failed = projects.isError || costs.isError || outcomes.isError || releases.isError;
  if (failed) return <>{header}<ErrorState message="Comparison data could not be loaded." onRetry={() => { void projects.refetch(); void costs.refetch(); void outcomes.refetch(); void releases.refetch(); }} /></>;
  if (!projects.data || !costs.data || !outcomes.data || !releases.data) return <>{header}<LoadingState rows={6} /></>;
  const rows = projects.data.filter((p) => ids.includes(p.id));
  if (rows.length < 2) return <>{header}<EmptyState title="Select at least two projects to compare" hint="Tick projects in the directory, in either the cards or the matrix view." /></>;
  const data = { releases: releases.data, costs: costs.data, outcomes: outcomes.data };
  const defs = compareRows(data)[focus];

  return (
    <>
      {header}
      {scopeDefault ? <Alert severity="info" sx={{ mb: 3 }}>No projects were selected, so this shows every project in {scope.portfolio === 'All programmes' ? 'the portfolio' : 'the selected programme'}. Pick projects in the directory to narrow it.</Alert> : null}
      {focus === 'outcomes' ? <Alert severity="info" sx={{ mb: 3 }}>Outcome measures use different definitions and periods per project. They are listed, not compared numerically.</Alert> : null}
      <CompareSummary focus={focus} projects={rows} data={data} />
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography variant="h2">{sentence(focus)} comparison</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>Reported fields and calculated totals per project, read across.</Typography>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Measure</TableCell>
                {rows.map((p) => <TableCell key={p.id} sx={{ textTransform: 'none', letterSpacing: 0, verticalAlign: 'top' }}>
                  <DomainTag>{programmes.data?.find((x) => x.id === p.programmeId)?.name ?? p.programmeId}</DomainTag>
                  <Box sx={{ mt: 0.75, fontSize: '0.875rem' }}><EntityLink id={p.id} label={p.name} /></Box>
                  <Box sx={{ mt: 0.75 }}><AvatarName name={p.owner} size={22} /></Box>
                </TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {defs.map((r) => (
                <TableRow key={r.label} hover>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'primary.main' }}>{r.label}</TableCell>
                  {rows.map((p) => <TableCell key={p.id} align={r.numeric ? 'right' : 'left'} sx={r.numeric ? { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } : undefined}>{r.cell(p)}</TableCell>)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', px: 2.5, py: 1.5 }}>Currency GBP; period FY26 year to date; definitions per DEF-06 and DEF-07.</Typography>
      </Paper>
    </>
  );
}
