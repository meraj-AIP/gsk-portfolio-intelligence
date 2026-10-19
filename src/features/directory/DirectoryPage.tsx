import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReview } from '@/app/context/ReviewContext';
import { useAllProjects, useDirectory, useFindings, useProgrammeRows, useProgrammes } from '@/shared/api/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { SegmentedToggle } from '@/shared/components/ui/Controls';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { ProgrammeCards, ProjectCards, SectionHeading } from './DirectoryCards';
import { DirectoryFilters } from './DirectoryFilters';
import { DirectoryMatrix } from './DirectoryMatrix';
import { DirectoryPager } from './DirectoryPager';
import { ProjectSummarySlot } from './ProjectSummarySlot';
import { useDirectoryUrlState } from './useDirectoryUrlState';

const VIEWS = [{ value: 'cards', label: 'Cards', icon: <GridViewIcon /> }, { value: 'matrix', label: 'Matrix', icon: <TableRowsOutlinedIcon /> }];

/** S04. Find, group and compare the work in the portfolio. */
export function DirectoryPage() {
  const { params, setParams } = useDirectoryUrlState();
  const { scope } = useReview();
  // listProjects already filters by programme on the server side, so a programme scope narrows the project rows there.
  const scoped = scope.portfolio !== 'All programmes';
  const directory = useDirectory(scoped ? { ...params, programmeId: scope.portfolio } : params);
  const programmeRows = useProgrammeRows(params.q, scope.portfolio);
  const programmes = useProgrammes();
  const allProjects = useAllProjects();
  const findings = useFindings();
  const navigate = useNavigate();
  const [summary, setSummary] = useUrlParam('summary');
  const [viewRaw, setView] = useUrlParam('view');
  const view = viewRaw === 'matrix' ? 'matrix' : 'cards';
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const inScope = (allProjects.data ?? []).filter((p) => !scoped || p.programmeId === scope.portfolio);
  const pgCount = scoped ? 1 : (programmes.data?.length ?? 0);
  const page = directory.data;
  const pager = page ? <DirectoryPager page={page} onPage={(n) => setParams({ page: n })} onSize={(n) => setParams({ pageSize: n, page: 0 })} /> : null;

  const projectsBody = () => {
    if (directory.isError) return <ErrorState message="The directory could not be loaded." onRetry={() => void directory.refetch()} />;
    if (!page) return <LoadingState rows={6} />;
    if (page.total === 0) return <EmptyState title="No projects match" hint="Try a broader search or clear a filter." />;
    if (view === 'cards') return <ProjectCards page={page} loading={directory.isFetching} programmes={programmes.data ?? []} findings={findings.data ?? []} selected={selected} onToggle={toggle} onPage={(n) => setParams({ page: n })} onSize={(n) => setParams({ pageSize: n, page: 0 })} />;
    return (
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography variant="h2">Project matrix</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>Lifecycle stage, worst position, governance gates and follow-up per project. Select rows to compare.</Typography>
        </Box>
        <DirectoryMatrix page={page} loading={directory.isFetching} programmes={programmes.data ?? []} findings={findings.data ?? []} params={params} onParams={setParams} selected={selected} onToggle={toggle} onOpen={(id) => setSummary(id)} />
        {pager}
      </Paper>
    );
  };

  return (
    <>
      <PageHeader
        eyebrow={allProjects.data ? <Typography variant="overline">{inScope.length} projects across {pgCount} programme{pgCount === 1 ? '' : 's'}</Typography> : null}
        title="Programmes and projects"
        subtitle="Search by name, objective, owner, capability, dependency or release. Select two or more projects to compare delivery, releases, cost or outcomes side by side."
        actions={<>
          <SegmentedToggle label="Directory view" options={VIEWS} value={view} onChange={(v) => setView(v === 'cards' ? null : v)} />
          <Button variant="contained" color="secondary" startIcon={<CompareArrowsIcon />} disabled={selected.length < 2} onClick={() => navigate(`/compare?ids=${selected.join(',')}`)}>
            {selected.length >= 2 ? `Compare ${selected.length} selected` : selected.length ? 'Select one more to compare' : 'Compare selected'}
          </Button>
        </>}
        meta={<DirectoryFilters key={params.q} params={params} onParams={setParams} programmes={programmes.data ?? []} projects={inScope} scopedTo={scoped ? scope.portfolio : undefined} />}
      />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: summary ? 8 : 12 }}>
          <Stack sx={{ gap: 4 }}>
            {view === 'cards' ? (
              <Box>
                <SectionHeading title="Programmes" subtitle="Business objective, sponsor, the next open commitment and the worst position among each programme's projects." />
                <ProgrammeCards rows={programmeRows.data} loading={programmeRows.isFetching} error={programmeRows.isError} onRetry={() => void programmeRows.refetch()} projects={allProjects.data ?? []} findings={findings.data ?? []} />
              </Box>
            ) : null}
            <Box>
              {view === 'cards' ? <SectionHeading title={`Projects${page ? ` (${page.total})` : ''}`} subtitle="Tick a card to add it to the comparison. The arrow opens the full record." /> : null}
              {projectsBody()}
            </Box>
          </Stack>
        </Grid>
        {summary ? <ProjectSummarySlot projectId={summary} onClose={() => setSummary(null)} /> : null}
      </Grid>
    </>
  );
}
