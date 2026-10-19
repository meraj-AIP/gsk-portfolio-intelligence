import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useReview } from '@/app/context/ReviewContext';
import { useAllProjects, useSharedConstraints } from '@/shared/api/hooks';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { scopeProjectIds } from '@/shared/lib/portfolio';
import { ConstraintList } from './ConstraintList';
import { leadSentence, scopeConstraints } from './ConstraintModel';
import { ConstraintTrace } from './ConstraintTrace';
import { DependencyNetwork } from './DependencyNetwork';

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

  return (
    <Stack sx={{ gap: 2 }}>
      <Typography variant="body1">{leadSentence(list)}</Typography>
      {list.length === 0 ? <EmptyState title="No shared constraints in this portfolio" hint="Choose a wider portfolio in the review bar, or open the network to see every relationship." /> : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <SectionCard title="Shared constraints" dense>
              <ConstraintList constraints={list} selectedId={selected?.node.id ?? null} onSelect={(id) => setSelected(id)} />
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 7 }}>
            <SectionCard title={selected ? `Trace: ${selected.node.label}` : 'Trace'}>
              {selected
                ? <ConstraintTrace key={selected.node.id} constraint={selected} scopeIds={scopeIds} focusId={focus} />
                : <Typography variant="body2" sx={{ color: 'text.secondary' }}>Select a constraint to see the programmes, projects, commitments and evidence it holds.</Typography>}
            </SectionCard>
          </Grid>
        </Grid>
      )}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <Button variant="outlined" aria-expanded={Boolean(network)} onClick={() => setNetwork(network ? null : 'graph')}>{network ? 'Hide network' : 'Show network'}</Button>
        <Typography variant="caption">Every recorded relationship, as a graph or an accessible list.</Typography>
      </Stack>
      {network ? <DependencyNetwork /> : null}
    </Stack>
  );
}
