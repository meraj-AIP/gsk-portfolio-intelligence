import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useReview } from '@/app/context/ReviewContext';
import { useAllProjects, useDependencies, useGraphNodes } from '@/shared/api/hooks';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { scopeProjectIds } from '@/shared/lib/portfolio';
import { DependencyDetail } from './DependencyDetail';
import { DependencyDialog } from './DependencyDialog';
import { DependencyFilters, useDependencyFilters } from './DependencyFilters';
import { DependencyGraph } from './DependencyGraph';
import { DependencyList } from './DependencyList';

/**
 * Secondary view under the constraints trace: every recorded relationship as a graph or an accessible list.
 * A recorded dependency does not by itself mean the connected work is delayed; the detail keeps the three kinds of impact apart.
 */
export function DependencyNetwork() {
  const { scope } = useReview();
  const nodes = useGraphNodes();
  const deps = useDependencies();
  const projects = useAllProjects();
  const filters = useDependencyFilters();
  const [focus, setFocus] = useUrlParam('focus');
  const [network, setNetwork] = useUrlParam('network');
  const smallScreen = useMediaQuery(useTheme().breakpoints.down('sm'));
  const view = network === 'list' ? 'list' : 'graph';

  if (nodes.isError || deps.isError || projects.isError) return <ErrorState message="Dependencies could not be loaded." onRetry={() => { void nodes.refetch(); void deps.refetch(); void projects.refetch(); }} />;
  if (!nodes.data || !deps.data || !projects.data) return <LoadingState rows={8} />;

  const all = scope.portfolio === 'All programmes';
  const inScopeIds = new Set([...scopeProjectIds(projects.data, scope.portfolio), scope.portfolio]);
  const scoped = deps.data.filter((d) => all || inScopeIds.has(d.fromId) || inScopeIds.has(d.toId));
  const { project, owner, type, before } = filters.values;
  const visible = scoped.filter((d) => (!project || d.fromId === project || d.toId === project) && (!owner || d.owner === owner) && (!type || d.type === type) && (!before || d.requiredDate <= before));
  const programmeOf = new Map(projects.data.map((p) => [p.id, p.programmeId]));
  const selected = deps.data.find((d) => d.id === focus) ?? null;
  const detail = selected ? <DependencyDetail key={selected.id} dependency={selected} nodes={nodes.data} /> : null;

  return (
    <Stack sx={{ gap: 1 }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <ToggleButtonGroup size="small" exclusive value={view} aria-label="Network view" onChange={(_, v: 'graph' | 'list' | null) => v && setNetwork(v)}>
          <ToggleButton value="graph">Graph</ToggleButton><ToggleButton value="list">Accessible list</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption">Dashed lines are reuse candidates awaiting owner assessment. Critical path is not calculated: no method has been agreed.</Typography>
      </Stack>
      <DependencyFilters filters={filters} projects={projects.data.filter((p) => all || inScopeIds.has(p.id))} owners={[...new Set(scoped.map((d) => d.owner))].sort()}
        listView={view === 'list'} summary={`${visible.length} of ${scoped.length} relationships in scope shown`} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title={view === 'graph' ? 'Relationship graph' : 'Relationships'} dense>
            {view === 'list'
              ? <DependencyList query={{ scope: project || scope.portfolio, owner, type, before }} nodes={nodes.data} selectedId={focus || null} onSelect={setFocus} />
              : !scoped.length ? <EmptyState title="No relationships in this portfolio" hint="Choose another portfolio in the review bar." />
                : <DependencyGraph nodes={nodes.data} dependencies={deps.data} programmeOf={programmeOf} visibleDependencyIds={new Set(visible.map((d) => d.id))} selectedId={focus || null} onSelect={setFocus} />}
          </SectionCard>
        </Grid>
        {smallScreen ? <DependencyDialog open={Boolean(selected)} onClose={() => setFocus(null)}>{detail}</DependencyDialog> : (
          <Grid size={{ xs: 12, lg: 4 }}>
            <SectionCard title="Selected relationship">
              {detail ?? <Typography variant="body2" sx={{ color: 'text.secondary' }}>Select a line in the graph or a row in the list. In the graph, Tab moves between relationships and Enter selects one.</Typography>}
            </SectionCard>
          </Grid>
        )}
      </Grid>
    </Stack>
  );
}
