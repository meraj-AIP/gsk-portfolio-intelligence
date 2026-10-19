import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useActions, useCostRecords, useDecisions, useGraphNodes, useOutcomeMeasures, useScopeChanges } from '@/shared/api/hooks';
import { EntityLink } from '@/shared/components/EntityLink';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { formatDate } from '@/shared/lib/format';
import type { Commitment, Finding, Project, Release } from '@/shared/types/domain';
import { DependencyList } from '@/features/portfolio/DependencyList';
import { CapabilityRecord } from './CapabilityRecord';
import { CommitmentRevisions } from './CommitmentRevisions';
import { CommitmentTimeline } from './CommitmentTimeline';
import { CostOutcomePanel } from './CostOutcomePanel';
import { DecisionsHistory } from './DecisionsHistory';
import { ReleaseRows } from './ReleaseRows';
import { ResourceConstraints } from './ResourceConstraints';
import { TechnicalIssues } from './TechnicalIssues';

export const PROJECT_TABS = ['Position', 'Delivery and scope', 'Dependencies', 'Releases', 'Cost and outcomes', 'Decisions and history'];

type Props = { tab: number; project: Project; findings: Finding[]; commitments: Commitment[]; releases: Release[] };

function ScopeChanges({ projectId }: { projectId: string }) {
  const scope = useScopeChanges();
  if (scope.isError) return <ErrorState message="Scope changes could not be loaded." onRetry={() => void scope.refetch()} />;
  if (!scope.data) return <LoadingState rows={2} />;
  const rows = scope.data.filter((s) => s.projectId === projectId);
  if (!rows.length) return <EmptyState title="No scope changes recorded" />;
  return (
    <Stack sx={{ gap: 1 }}>
      {rows.map((s) => (
        <Box key={s.id} sx={(t) => ({ p: 1.5, borderRadius: 1, bgcolor: t.palette.brand.canvas, border: `1px solid ${t.palette.divider}` })}>
          <Typography variant="overline" component="p">{formatDate(s.date)}</Typography>
          <Typography variant="body2" sx={{ mt: 0.25 }}>Added {s.added}; removed {s.removed}; revised {s.revised}.</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>Owner-reported effect: {s.ownerReportedEffect} <EntityLink id={s.evidenceId} /></Typography>
        </Box>
      ))}
    </Stack>
  );
}

/** Tab bodies for the project record after Position, which the page renders itself. `tab` is the index in PROJECT_TABS. */
export function ProjectTabs({ tab, project: p, findings: fnds, commitments: cs, releases }: Props) {
  const nodes = useGraphNodes();
  const costs = useCostRecords();
  const outcomes = useOutcomeMeasures();
  const decisions = useDecisions();
  const actions = useActions();
  const navigate = useNavigate();
  const [, openFinding] = useUrlParam('finding');
  const [focus, setFocus] = useUrlParam('focus');

  if (tab === 1) return (
    <Stack sx={{ gap: 3 }}>
      <SectionCard title="Commitment timeline" dense><CommitmentTimeline commitments={cs} /></SectionCard>
      <SectionCard title="Scope-change history" dense><ScopeChanges projectId={p.id} /></SectionCard>
      <SectionCard title="Commitment revision history" dense subtitle="Original, each revision, current and actual are kept apart so a moved date never reads as the plan."><CommitmentRevisions commitments={cs} /></SectionCard>
      <SectionCard title="Technical issues affecting delivery" dense><TechnicalIssues projectId={p.id} /></SectionCard>
      <SectionCard title="Resource constraints" dense><ResourceConstraints projectId={p.id} commitments={cs} /></SectionCard>
    </Stack>
  );
  if (tab === 2) return (
    <SectionCard title="Required inputs, teams and shared services" dense>
      <DependencyList query={{ scope: p.id, owner: '', type: '' }} nodes={nodes.data ?? []} selectedId={focus || null} onSelect={(d) => setFocus(d)} />
      {focus ? <Button size="small" sx={{ mt: 1 }} onClick={() => navigate(`/dependencies?focus=${focus}`)}>Open {focus} in the graph</Button> : null}
    </SectionCard>
  );
  if (tab === 3) return (
    <Stack sx={{ gap: 3 }}>
      <SectionCard title="Planned and delivered capabilities" dense><ReleaseRows releases={releases} /></SectionCard>
      <SectionCard title="Business capability" dense><CapabilityRecord projectId={p.id} releases={releases} /></SectionCard>
    </Stack>
  );
  if (tab === 4) return (
    <SectionCard title="Budget, actual, forecast, adoption and benefits">
      {costs.isError || outcomes.isError ? <ErrorState message="Cost or outcome records could not be loaded." onRetry={() => { void costs.refetch(); void outcomes.refetch(); }} />
        : !costs.data || !outcomes.data ? <LoadingState rows={4} />
        : <CostOutcomePanel projectIds={[p.id]} costs={costs.data} outcomes={outcomes.data} funding={p.funding} />}
    </SectionCard>
  );
  return (
    <SectionCard title="Conclusions, actions, changes and review history">
      <DecisionsHistory decisions={(decisions.data ?? []).filter((d) => fnds.some((f) => f.id === d.findingId))} actions={(actions.data ?? []).filter((a) => fnds.some((f) => f.id === a.findingId))} findings={fnds} onOpenFinding={(f) => openFinding(f)} />
    </SectionCard>
  );
}
