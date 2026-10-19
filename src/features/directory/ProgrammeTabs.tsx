import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useActions, useCommitments, useCostRecords, useDecisions, useDependencies, useGraphNodes, useOutcomeMeasures, useReleases } from '@/shared/api/hooks';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { Legend } from '@/shared/components/Legend';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { contributingProjects, programmePosition } from '@/shared/lib/portfolio';
import { DIMENSIONS, type Finding, type Programme, type Project } from '@/shared/types/domain';
import { FindingsList } from '@/features/findings/FindingsList';
import { DependencyList } from '@/features/portfolio/DependencyList';
import { CommitmentTimeline } from './CommitmentTimeline';
import { CostOutcomePanel } from './CostOutcomePanel';
import { DecisionsHistory } from './DecisionsHistory';
import { ProjectCard } from './ProjectCard';
import { ReleaseRows } from './ReleaseRows';

export const PROGRAMME_TABS = ['Programme position', 'Delivery', 'Projects', 'Dependencies', 'Releases', 'Cost and outcomes', 'Decisions and history'];

type Props = { tab: number; programme: Programme; projects: Project[]; findings: Finding[] };

/** Tab bodies for the programme record; each loads only the records it shows. */
export function ProgrammeTabs({ tab, programme: pg, projects: prjs, findings: fnds }: Props) {
  const commitments = useCommitments();
  const deps = useDependencies();
  const nodes = useGraphNodes();
  const releases = useReleases();
  const costs = useCostRecords();
  const outcomes = useOutcomeMeasures();
  const decisions = useDecisions();
  const actions = useActions();
  const navigate = useNavigate();
  const [, openFinding] = useUrlParam('finding');
  const [focus, setFocus] = useUrlParam('focus');
  const ids = prjs.map((p) => p.id);
  const pos = programmePosition(prjs);
  const missing = prjs.filter((p) => p.freshness !== 'current');

  if (tab === 0) return (
    <Stack sx={{ gap: 3 }}>
      <SectionCard title="Position by dimension" badge="Worst project sets it" actions={<Legend />}>
        <Stack sx={{ gap: 1.25 }}>
          {DIMENSIONS.map((d) => (
            <Stack key={d} direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap', pb: 1.25, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ minWidth: 150 }}><ConditionChip condition={pos[d]} label={d.charAt(0).toUpperCase() + d.slice(1)} /></Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Set by {contributingProjects(prjs, d, pos[d]).map((p) => p.name).join(', ') || 'no project'}</Typography>
            </Stack>
          ))}
          {missing.length ? <Typography variant="body2" sx={{ color: 'condition.attention', fontWeight: 600 }}>{missing.length} project{missing.length === 1 ? '' : 's'} with stale or missing information: {missing.map((p) => p.name).join(', ')}. This gap is part of the assessment.</Typography> : null}
        </Stack>
      </SectionCard>
      <SectionCard title="Material findings" badge={String(fnds.length)}><FindingsList findings={fnds} onOpen={(f) => openFinding(f)} /></SectionCard>
    </Stack>
  );
  if (tab === 1) return <SectionCard title="Combined milestone and commitment timeline" dense>{commitments.isError ? <ErrorState message="Commitments could not be loaded." onRetry={() => void commitments.refetch()} /> : !commitments.data ? <LoadingState rows={4} /> : <CommitmentTimeline commitments={commitments.data.filter((c) => ids.includes(c.projectId))} />}</SectionCard>;
  if (tab === 2) return prjs.length ? (
    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: 'repeat(3, 1fr)' } }}>
      {prjs.map((p) => <ProjectCard key={p.id} project={p} programmeName={pg.name} finding={fnds.find((f) => f.affectedIds.includes(p.id))} />)}
    </Box>
  ) : <EmptyState title="No projects in this programme" />;
  if (tab === 3) return (
    <SectionCard title="Shared constraints, hand-offs and external dependencies" dense>
      <DependencyList query={{ scope: pg.id, owner: '', type: '' }} nodes={nodes.data ?? []} selectedId={focus || null} onSelect={(d) => setFocus(d)} />
      {focus ? <Typography variant="body2" sx={{ mt: 1 }}>Affected commitments: {(deps.data ?? []).find((d) => d.id === focus)?.affectedCommitmentIds.join(', ') || 'none recorded'}. <Button size="small" onClick={() => navigate(`/dependencies?focus=${focus}`)}>Open in graph</Button></Typography> : null}
    </SectionCard>
  );
  if (tab === 4) return <SectionCard title="Capabilities delivered through the programme" dense>{releases.isError ? <ErrorState message="Releases could not be loaded." onRetry={() => void releases.refetch()} /> : !releases.data ? <LoadingState rows={3} /> : <ReleaseRows releases={releases.data.filter((r) => ids.includes(r.projectId))} />}</SectionCard>;
  if (tab === 5) return (
    <SectionCard title="Programme budget, expenditure, forecast and outcome evidence">
      {costs.isError || outcomes.isError ? <ErrorState message="Cost or outcome records could not be loaded." onRetry={() => { void costs.refetch(); void outcomes.refetch(); }} />
        : !costs.data || !outcomes.data ? <LoadingState rows={4} />
        : <CostOutcomePanel projectIds={ids} costs={costs.data} outcomes={outcomes.data} funding={pg.funding} attributionNote="Shared expenditure and benefits need an attribution rule before they enter programme totals." />}
    </SectionCard>
  );
  return (
    <SectionCard title="Programme conclusions, actions and changes">
      <DecisionsHistory decisions={(decisions.data ?? []).filter((d) => fnds.some((f) => f.id === d.findingId))} actions={(actions.data ?? []).filter((a) => fnds.some((f) => f.id === a.findingId))} findings={fnds} onOpenFinding={(f) => openFinding(f)} />
    </SectionCard>
  );
}
