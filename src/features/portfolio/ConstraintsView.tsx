import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useReview } from '@/app/context/ReviewContext';
import { useAllProjects, useSharedConstraints } from '@/shared/api/hooks';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { SegmentedToggle } from '@/shared/components/ui/Controls';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { scopeProjectIds } from '@/shared/lib/portfolio';
import { ConstraintList } from './ConstraintList';
import { leadSentence, scopeConstraints } from './ConstraintModel';
import { ConstraintTrace } from './ConstraintTrace';
import { DependencyNetwork } from './DependencyNetwork';

const NETWORK_VIEWS = [{ value: '', label: 'Hidden' }, { value: 'graph', label: 'Graph' }, { value: 'list', label: 'Accessible list' }];

/** Constraints tab on the portfolio page: which shared inputs hold the most work, and everything each one touches. */
export function ConstraintsView() {
  const { scope } = useReview();
  const constraints = useSharedConstraints(scope.portfolio);
  const projects = useAllProjects();
  const [selectedId, setSelected] = useUrlParam('constraint');
  const [network, setNetwork] = useUrlParam('network');
  const [focus] = useUrlParam('focus');

  if (constraints.isError || projects.isError) return <ErrorState message="Shared constraints could not be loaded." onRetry={() => { void constraints.refetch(); void projects.refetch(); }} />;
  if (!constraints.data || !projects.data) return <LoadingState rows={6} />;

  const scopeIds = scopeProjectIds(projects.data, scope.portfolio);
  const list = scopeConstraints(constraints.data, projects.data, scopeIds);
  // A shared link to one dependency (?focus=DEP-..) opens the constraint it rests on, unless a constraint is named outright.
  const selected = list.find((c) => (selectedId ? c.node.id === selectedId : c.dependencyIds.includes(focus))) ?? null;
  const networkView = network === 'list' ? 'list' : network ? 'graph' : '';

  return (
    <Stack sx={{ gap: 3 }}>
      <SectionCard title="Shared constraints" badge={String(list.length)} subtitle={leadSentence(list)}>
        {list.length === 0
          ? <EmptyState title="No shared constraints in this portfolio" hint="Choose a wider portfolio in the review bar, or open the network to see every relationship." />
          : <ConstraintList constraints={list} selectedId={selected?.node.id ?? null} onSelect={(id) => setSelected(id)} />}
      </SectionCard>
      {list.length > 0 ? (
        selected
          ? <ConstraintTrace key={selected.node.id} constraint={selected} scopeIds={scopeIds} focusId={focus} />
          : <EmptyState title="Select a constraint" hint="Choose a row above to see the programmes, projects, commitments and evidence it holds." />
      ) : null}
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' }, gap: 1.5 }}>
        <Box>
          <Typography variant="h2">Dependency network</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>Every recorded relationship, as a graph or an accessible list.</Typography>
        </Box>
        <SegmentedToggle label="Dependency network view" options={NETWORK_VIEWS} value={networkView} onChange={(v) => setNetwork(v || null)} />
      </Stack>
      {networkView ? <DependencyNetwork /> : null}
    </Stack>
  );
}
