import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useNavigate, useParams } from 'react-router-dom';
import { useActions, useCommitments, useCostRecords, useDecisions, useFindings, useGraphNodes, useOutcomeMeasures, useProgrammes, useProject, useReleases, useScopeChanges } from '@/shared/api/hooks';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { EntityLink } from '@/shared/components/EntityLink';
import { Freshness } from '@/shared/components/Freshness';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { formatDate } from '@/shared/lib/format';
import { DIMENSIONS } from '@/shared/types/domain';
import { FindingsList } from '@/features/findings/FindingsList';
import { DependencyList } from '@/features/portfolio/DependencyList';
import { CapabilityRecord } from './CapabilityRecord';
import { CommitmentRevisions } from './CommitmentRevisions';
import { CommitmentTimeline } from './CommitmentTimeline';
import { CostOutcomePanel } from './CostOutcomePanel';
import { DecisionsHistory } from './DecisionsHistory';
import { GovernanceGates } from './GovernanceGates';
import { ProjectHeaderActions } from './ProjectHeaderActions';
import { ReleaseRows } from './ReleaseRows';
import { ResourceConstraints } from './ResourceConstraints';
import { SinceReviewStrip } from './SinceReviewStrip';
import { TechnicalIssues } from './TechnicalIssues';

const TABS = ['Position', 'Delivery and scope', 'Dependencies', 'Releases', 'Cost and outcomes', 'Decisions and history'];

/** S06. The maintained record of a project's delivery position and contribution to outcomes. */
export function ProjectPage() {
  const { id = '' } = useParams();
  const project = useProject(id);
  const programmes = useProgrammes();
  const findings = useFindings();
  const commitments = useCommitments();
  const scopeChanges = useScopeChanges();
  const nodes = useGraphNodes();
  const releases = useReleases();
  const costs = useCostRecords();
  const outcomes = useOutcomeMeasures();
  const decisions = useDecisions();
  const actions = useActions();
  const navigate = useNavigate();
  const [tabRaw, setTab] = useUrlParam('tab');
  const [, openFinding] = useUrlParam('finding');
  const [focus, setFocus] = useUrlParam('focus');
  const tab = Number(tabRaw || 0);

  if (project.isError) return <ErrorState message="Project could not be loaded." onRetry={() => void project.refetch()} />;
  if (project.isLoading || !findings.data) return <LoadingState rows={8} />;
  const p = project.data;
  if (!p) return <EmptyState title="Project not found" />;
  const pg = programmes.data?.find((x) => x.id === p.programmeId);
  const fnds = findings.data.filter((f) => f.affectedIds.includes(p.id));
  const unresolved = fnds.find((f) => f.responses.every((r) => r.findingVersion !== f.version));
  const material = unresolved ?? fnds.find((f) => f.persistent) ?? fnds[0];
  const projectReleases = (releases.data ?? []).filter((r) => r.projectId === p.id);
  const cs = (commitments.data ?? []).filter((c) => c.projectId === p.id);
  const done = cs.filter((c) => c.actualDate).length;

  return (
    <>
      <PageHeader title={p.name} subtitle={p.purpose}
        actions={<ProjectHeaderActions project={p} material={material} />}
        meta={<KeyValueList columns={3} items={[
          { label: 'Programme', value: pg ? <EntityLink id={pg.id} label={pg.name} /> : p.programmeId }, { label: 'Owner', value: p.owner }, { label: 'Reporting', value: <Freshness reportingDate={p.reportingDate} freshness={p.freshness} /> },
          { label: 'Current commitment', value: `${p.commitment.label}: ${p.commitment.actual ? `done ${formatDate(p.commitment.actual)}` : `due ${formatDate(p.commitment.current)}`}${p.commitment.current !== p.commitment.original ? ` (originally ${formatDate(p.commitment.original)})` : ''}` },
          { label: 'Material unresolved finding', value: unresolved ? <EntityLink id={unresolved.id} label={unresolved.title} /> : 'None' },
          { label: 'Completion', value: `${done} of ${cs.length} commitments completed. No percentage is shown because no completion method has been agreed with the client.` },
        ]} />} />
      <SinceReviewStrip findings={fnds} projects={[p]} />
      <Tabs value={tab} onChange={(_, v: number) => setTab(String(v))} variant="scrollable" sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>{TABS.map((t) => <Tab key={t} label={t} />)}</Tabs>
      {tab === 0 ? (
        <Stack sx={{ gap: 2 }}>
          <SectionCard title="Current assessment">
            <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>{DIMENSIONS.map((d) => <ConditionChip key={d} condition={p.position[d]} label={`${d.charAt(0).toUpperCase() + d.slice(1)}: ${p.position[d]}`} />)}<Chip label={`Stage: ${p.stage}`} variant="outlined" /></Stack>
            <GovernanceGates gates={p.gates} />
            {p.outstandingResponse ? <Typography variant="body2" sx={{ mt: 1.5, color: 'condition.attention', fontWeight: 600 }}>Outstanding response: {p.outstandingResponse}</Typography> : null}
          </SectionCard>
          <SectionCard title={`Findings (${fnds.length})`}><FindingsList findings={fnds} onOpen={(f) => openFinding(f)} /></SectionCard>
        </Stack>
      ) : null}
      {tab === 1 ? (
        <Stack sx={{ gap: 2 }}>
          <SectionCard title="Commitment timeline" dense><CommitmentTimeline commitments={cs} /></SectionCard>
          <SectionCard title="Scope-change history">
            {(scopeChanges.data ?? []).filter((s) => s.projectId === p.id).map((s) => <Typography key={s.id} variant="body2" sx={{ mb: 1 }}><strong>{formatDate(s.date)}</strong>: added {s.added}; removed {s.removed}; revised {s.revised}. Owner-reported effect: {s.ownerReportedEffect} <EntityLink id={s.evidenceId} /></Typography>)}
            {!(scopeChanges.data ?? []).some((s) => s.projectId === p.id) ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>No scope changes recorded.</Typography> : null}
          </SectionCard>
          <SectionCard title="Commitment revision history"><CommitmentRevisions commitments={cs} /></SectionCard>
          <SectionCard title="Technical issues affecting delivery" dense><TechnicalIssues projectId={p.id} /></SectionCard>
          <SectionCard title="Resource constraints" dense><ResourceConstraints projectId={p.id} commitments={cs} /></SectionCard>
        </Stack>
      ) : null}
      {tab === 2 ? <SectionCard title="Required inputs, teams and shared services" dense><DependencyList query={{ scope: p.id, owner: '', type: '' }} nodes={nodes.data ?? []} selectedId={focus || null} onSelect={(d) => setFocus(d)} />{focus ? <Button size="small" sx={{ mt: 1 }} onClick={() => navigate(`/dependencies?focus=${focus}`)}>Open {focus} in the graph</Button> : null}</SectionCard> : null}
      {tab === 3 ? (
        <Stack sx={{ gap: 2 }}>
          <SectionCard title="Planned and delivered capabilities" dense><ReleaseRows releases={projectReleases} /></SectionCard>
          <SectionCard title="Business capability"><CapabilityRecord projectId={p.id} releases={projectReleases} /></SectionCard>
        </Stack>
      ) : null}
      {tab === 4 ? <SectionCard title="Budget, actual, forecast, adoption and benefits">{costs.isError || outcomes.isError ? <ErrorState message="Cost or outcome records could not be loaded." onRetry={() => { void costs.refetch(); void outcomes.refetch(); }} /> : !costs.data || !outcomes.data ? <LoadingState rows={4} /> : <CostOutcomePanel projectIds={[p.id]} costs={costs.data ?? []} outcomes={outcomes.data ?? []} funding={p.funding} />}</SectionCard> : null}
      {tab === 5 ? <SectionCard title="Conclusions, actions, changes and review history"><DecisionsHistory decisions={(decisions.data ?? []).filter((d) => fnds.some((f) => f.id === d.findingId))} actions={(actions.data ?? []).filter((a) => fnds.some((f) => f.id === a.findingId))} findings={fnds} onOpenFinding={(f) => openFinding(f)} /></SectionCard> : null}
    </>
  );
}
