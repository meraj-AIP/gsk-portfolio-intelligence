import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useReview } from '@/app/context/ReviewContext';
import { useAllProjects, useCapabilities, useProgrammes, useReleaseSummaries, useSnapshots } from '@/shared/api/hooks';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { SegmentedToggle } from '@/shared/components/ui/Controls';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { scopeProjectIds } from '@/shared/lib/portfolio';
import { ReleaseCard } from './ReleaseCard';
import { ReleaseFilters } from './ReleaseFilters';
import { ReleasePanel } from './ReleasePanel';
import { ReleaseTable } from './ReleaseTable';
import { ReleaseTimeline } from './ReleaseTimeline';
import { filterReleases, useReleaseFilters } from './releaseFilterModel';
import { releaseLead } from './releaseLead';

const VIEWS = [{ value: 'list', label: 'Cards' }, { value: 'timeline', label: 'Timeline' }, { value: 'table', label: 'Table' }];

/** Releases tab on This week: what became usable, for whom, against plan, with adoption and what is still open. */
export function ReleasesView() {
  const { scope, viewSnapshot, isReadOnly } = useReview();
  const summaries = useReleaseSummaries();
  const projects = useAllProjects();
  const programmes = useProgrammes();
  const capabilities = useCapabilities();
  const snapshots = useSnapshots();
  const filters = useReleaseFilters();
  const [selected, setSelected] = useUrlParam('release');
  const [view, setView] = useUrlParam('view');

  if (summaries.isError || projects.isError || programmes.isError || snapshots.isError) return <ErrorState message="Releases could not be loaded." onRetry={() => { void summaries.refetch(); void projects.refetch(); void programmes.refetch(); void snapshots.refetch(); }} />;
  if (!summaries.data || !projects.data || !programmes.data || !snapshots.data) return <LoadingState rows={6} />;

  const week = ((isReadOnly ? viewSnapshot : undefined) ?? snapshots.data.find((s) => s.status === 'open'))?.week ?? '';
  const ids = scopeProjectIds(projects.data, scope.portfolio);
  const releases = summaries.data.map((s) => s.release);
  const programmeOf = (pid: string) => projects.data.find((p) => p.id === pid)?.programmeId ?? '';
  const filtered = filterReleases(releases, projects.data, capabilities.data ?? [], ids, filters.values, week);
  const shownIds = new Set(filtered.map((r) => r.id));
  const shown = summaries.data.filter((s) => shownIds.has(s.release.id));
  const thisWeek = summaries.data.filter((s) => s.release.week === week && ids.includes(s.release.projectId));
  const sel = summaries.data.find((s) => s.release.id === selected)?.release ?? null;
  const nameOf = (pid: string) => projects.data.find((p) => p.id === pid)?.name ?? pid;
  const owners = [...new Set(releases.filter((r) => ids.includes(r.projectId)).map((r) => r.owner))];
  const scopedProgrammes = programmes.data.filter((p) => scope.portfolio === 'All programmes' || p.id === scope.portfolio);
  const programmeName = (pid: string) => programmes.data.find((p) => p.id === programmeOf(pid))?.name ?? 'Programme not recorded';
  const programmeCounts: Record<string, number> = {};
  filterReleases(releases, projects.data, capabilities.data ?? [], ids, { ...filters.values, programme: '' }, week)
    .forEach((r) => { const pg = programmeOf(r.projectId); programmeCounts[pg] = (programmeCounts[pg] ?? 0) + 1; });
  const has = shown.length > 0;
  const rowsByProgramme = scopedProgrammes.flatMap((pg) => shown.filter((s) => programmeOf(s.release.projectId) === pg.id).map((s) => ({ r: s.release, pg })));
  const mode = view === 'timeline' || view === 'table' ? view : 'list';

  return (
    <Stack sx={{ gap: 3 }}>
      <ReleaseFilters values={filters.values} onChange={filters.set} programmes={scopedProgrammes} programmeCounts={programmeCounts} owners={owners}
        capabilities={(capabilities.data ?? []).filter((c) => c.projectIds.some((p) => ids.includes(p)))} />
      {capabilities.isError ? <Alert severity="warning">Business capabilities could not be loaded, so the capability filter is empty.</Alert> : null}
      <SectionCard title={filters.values.weeks === 'all' ? 'All releases' : 'This week’s releases'} badge={`${shown.length} shown`}
        subtitle={<>
          <Typography variant="body2" component="span" sx={{ display: 'block', color: 'text.primary' }}>{releaseLead(thisWeek)}</Typography>
          <Typography variant="caption" component="span" sx={{ display: 'block', mt: 0.5 }}>Each release is counted once however many deployments reference it. Adoption figures are early evidence with their observation period shown.</Typography>
        </>}
        actions={<SegmentedToggle label="Release view" options={VIEWS} value={mode} onChange={(v) => setView(v === 'list' ? null : v)} />}>
        {!has ? <EmptyState title="No releases match" hint="Include earlier weeks, clear a filter or widen the portfolio scope." /> : null}
        {has && mode === 'timeline' ? <ReleaseTimeline releases={filtered} projects={projects.data} programmes={programmes.data} reportingDate={scope.reportingDate} selectedId={sel?.id ?? null} onSelect={setSelected} /> : null}
        {has && mode === 'table' ? <ReleaseTable rows={rowsByProgramme} projects={projects.data} selectedId={sel?.id ?? null} onSelect={setSelected} /> : null}
        {has && mode === 'list' ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: 'repeat(3, 1fr)' }, gap: 3 }}>
            {shown.map((s) => (
              <ReleaseCard key={s.release.id} summary={s} projectName={nameOf(s.release.projectId)} programmeName={programmeName(s.release.projectId)}
                selected={s.release.id === sel?.id} onSelect={() => setSelected(s.release.id)} />
            ))}
          </Box>
        ) : null}
      </SectionCard>
      <ReleasePanel key={sel?.id ?? 'none'} release={sel} previous={sel?.previousReleaseId ? releases.find((r) => r.id === sel.previousReleaseId) : undefined}
        projectName={sel ? nameOf(sel.projectId) : ''} programmeName={sel ? programmeName(sel.projectId) : ''} readOnly={isReadOnly} onClose={() => setSelected(null)} />
    </Stack>
  );
}
