import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useCommitments, useFindings, useProgrammes, useProject, useReleases } from '@/shared/api/hooks';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { EntityLink } from '@/shared/components/EntityLink';
import { Freshness } from '@/shared/components/Freshness';
import { Legend } from '@/shared/components/Legend';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { DomainTag, StatusChip } from '@/shared/components/ui/StatusChip';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { formatDate } from '@/shared/lib/format';
import { DIMENSIONS } from '@/shared/types/domain';
import { FindingsList } from '@/features/findings/FindingsList';
import { gateSummary, riskLabel, sentence, worstOf } from './directoryModel';
import { FactStrip } from './FactStrip';
import { GovernanceGates } from './GovernanceGates';
import { ProjectHeaderActions } from './ProjectHeaderActions';
import { PROJECT_TABS, ProjectTabs } from './ProjectTabs';
import { SinceReviewStrip } from './SinceReviewStrip';

/** S06. The maintained record of a project's delivery position and contribution to outcomes. */
export function ProjectPage() {
  const { id = '' } = useParams();
  const project = useProject(id);
  const programmes = useProgrammes();
  const findings = useFindings();
  const commitments = useCommitments();
  const releases = useReleases();
  const [tabRaw, setTab] = useUrlParam('tab');
  const [, openFinding] = useUrlParam('finding');
  const tab = Number(tabRaw || 0);

  if (project.isError || findings.isError) return <ErrorState message="Project could not be loaded." onRetry={() => { void project.refetch(); void findings.refetch(); }} />;
  if (project.isLoading || !findings.data) return <LoadingState rows={8} />;
  const p = project.data;
  if (!p) return <EmptyState title="Project not found" />;
  const pg = programmes.data?.find((x) => x.id === p.programmeId);
  const fnds = findings.data.filter((f) => f.affectedIds.includes(p.id));
  const unresolved = fnds.find((f) => f.responses.every((r) => r.findingVersion !== f.version));
  const material = unresolved ?? fnds.find((f) => f.persistent) ?? fnds[0];
  const cs = (commitments.data ?? []).filter((c) => c.projectId === p.id);
  const done = cs.filter((c) => c.actualDate).length;
  const gates = gateSummary(p.gates);
  const moved = p.commitment.current !== p.commitment.original;

  return (
    <>
      <PageHeader
        eyebrow={<>
          <RouterLink to={`/programmes/${p.programmeId}`} style={{ textDecoration: 'none' }}><DomainTag strong>{pg?.name ?? p.programmeId}</DomainTag></RouterLink>
          <StatusChip tone="info" dot={false}>Stage: {p.stage}</StatusChip>
          <ConditionChip condition={worstOf(p.position).condition} label={riskLabel(p)} />
          <Typography variant="label" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{p.id}</Typography>
        </>}
        title={p.name} subtitle={p.purpose}
        actions={<ProjectHeaderActions project={p} material={material} />}
        meta={<FactStrip items={[
          { label: 'Owner', value: <AvatarName name={p.owner} subtitle={p.businessArea} size={24} /> },
          { label: 'Current commitment', value: <>{p.commitment.label}<Typography component="span" sx={{ display: 'block', fontSize: '0.6875rem', color: moved ? 'condition.attention' : 'text.secondary' }}>{p.commitment.actual ? `Done ${formatDate(p.commitment.actual)}` : `Due ${formatDate(p.commitment.current)}`}{moved ? `, originally ${formatDate(p.commitment.original)}` : ''}</Typography></> },
          { label: 'Freshness', value: <Freshness reportingDate={p.reportingDate} freshness={p.freshness} /> },
          { label: 'Governance', value: `${gates.passed} of ${gates.total} gates passed${gates.returned ? `, ${gates.returned} returned` : ''}` },
          { label: 'Commitments completed', value: commitments.data ? `${done} of ${cs.length}` : 'Loading' },
          { label: 'Material unresolved finding', value: unresolved ? <EntityLink id={unresolved.id} label={unresolved.title} /> : 'None' },
        ]} />}
      />
      <SectionCard title="Governance and compliance vetting" sx={{ mb: 3 }} dense subtitle="A solution is not available to the business until the required gates have passed.">
        <GovernanceGates gates={p.gates} />
      </SectionCard>
      <SinceReviewStrip findings={fnds} projects={[p]} />
      <Tabs value={tab} onChange={(_, v: number) => setTab(String(v))} variant="scrollable" sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>{PROJECT_TABS.map((t) => <Tab key={t} label={t} />)}</Tabs>
      {tab === 0 ? (
        <Stack sx={{ gap: 3 }}>
          <SectionCard title="Current assessment" actions={<Legend />}>
            <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>{DIMENSIONS.map((d) => <ConditionChip key={d} condition={p.position[d]} label={`${sentence(d)}: ${p.position[d]}`} />)}</Stack>
            {p.outstandingResponse ? <Typography variant="body2" sx={{ mt: 1.5, color: 'condition.attention', fontWeight: 600 }}>Outstanding response: {p.outstandingResponse}</Typography> : null}
            <Typography variant="caption" sx={{ display: 'block', mt: 1.5 }}>No completion percentage is shown because no completion method has been agreed with the client.</Typography>
          </SectionCard>
          <SectionCard title="Findings" badge={String(fnds.length)}><FindingsList findings={fnds} onOpen={(f) => openFinding(f)} /></SectionCard>
        </Stack>
      ) : (
        <ProjectTabs tab={tab} project={p} findings={fnds} commitments={cs} releases={(releases.data ?? []).filter((r) => r.projectId === p.id)} />
      )}
    </>
  );
}
