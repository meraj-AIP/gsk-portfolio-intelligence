import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useBriefingTray } from '@/app/context/BriefingTrayContext';
import { useActions, useAllProjects, useCommitments, useCostRecords, useDecisions, useDependencies, useFindings, useGraphNodes, useOutcomeMeasures, useProgramme, useReleases } from '@/shared/api/hooks';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { Legend } from '@/shared/components/Legend';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { formatDate } from '@/shared/lib/format';
import { contributingProjects, programmePosition } from '@/shared/lib/portfolio';
import { DIMENSIONS } from '@/shared/types/domain';
import { FindingsList } from '@/features/findings/FindingsList';
import { DependencyList } from '@/features/portfolio/DependencyList';
import { PortfolioMatrix } from '@/features/portfolio/PortfolioMatrix';
import { BusinessContribution } from './BusinessContribution';
import { CommitmentTimeline } from './CommitmentTimeline';
import { CostOutcomePanel } from './CostOutcomePanel';
import { DecisionsHistory } from './DecisionsHistory';
import { ReleaseRows } from './ReleaseRows';
import { RequestResponseButton } from './RequestResponseButton';
import { SinceReviewStrip } from './SinceReviewStrip';

// Change markers belong to the portfolio comparison view; the programme page shows the current position only.
const NO_CHANGES = new Map<string, string>();

const TABS = ['Programme position', 'Delivery', 'Projects', 'Dependencies', 'Releases', 'Cost and outcomes', 'Decisions and history'];

/** S05. The programme's business purpose and how its projects are delivering it. */
export function ProgrammePage() {
  const { id = '' } = useParams();
  const programme = useProgramme(id);
  const projects = useAllProjects();
  const findings = useFindings();
  const commitments = useCommitments();
  const deps = useDependencies();
  const nodes = useGraphNodes();
  const releases = useReleases();
  const costs = useCostRecords();
  const outcomes = useOutcomeMeasures();
  const decisions = useDecisions();
  const actions = useActions();
  const tray = useBriefingTray();
  const navigate = useNavigate();
  const [, setParams] = useSearchParams();
  const [tabRaw, setTab] = useUrlParam('tab');
  const [, openFinding] = useUrlParam('finding');
  const [focus, setFocus] = useUrlParam('focus');
  const tab = Number(tabRaw || 0);

  if (programme.isError) return <ErrorState message="Programme could not be loaded." onRetry={() => void programme.refetch()} />;
  if (programme.isLoading || !projects.data || !findings.data) return <LoadingState rows={8} />;
  const pg = programme.data;
  if (!pg) return <EmptyState title="Programme not found" />;
  const prjs = projects.data.filter((p) => p.programmeId === pg.id);
  const ids = prjs.map((p) => p.id);
  const fnds = findings.data.filter((f) => f.affectedIds.some((a) => ids.includes(a) || a === pg.id));
  const material = fnds.find((f) => f.persistent) ?? fnds[0];
  const pos = programmePosition(prjs);
  const missing = prjs.filter((p) => p.freshness !== 'current');

  return (
    <>
      <PageHeader title={pg.name} subtitle={pg.objective}
        actions={<Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" disabled={tray.has(pg.id)} onClick={() => tray.add(pg.id)}>{tray.has(pg.id) ? 'In briefing' : 'Prepare programme briefing'}</Button>
          <Button variant="outlined" onClick={() => setParams((prev) => { const next = new URLSearchParams(prev); next.set('ask', pg.id); next.set('q', 'What changed against the previous commitment?'); return next; }, { replace: true })}>Ask about this programme</Button>
          {material ? <RequestResponseButton findingId={material.id} defaultOwner={material.requestedOwner ?? pg.lead} /> : null}
        </Stack>}
        meta={<KeyValueList columns={3} items={[{ label: 'Sponsor', value: pg.sponsor }, { label: 'Programme lead', value: pg.lead }, { label: 'Reporting date', value: formatDate(pg.reportingDate) }, { label: 'Current assessment', value: pg.assessment }, { label: 'Next required decision', value: pg.nextDecision }, { label: 'Funding', value: pg.funding.map((f) => `${f.businessUnit} ${f.percent}%`).join('; ') }]} />} />
      <BusinessContribution programmeId={pg.id} />
      <SinceReviewStrip findings={fnds} projects={prjs} />
      <Tabs value={tab} onChange={(_, v: number) => setTab(String(v))} variant="scrollable" sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>{TABS.map((t) => <Tab key={t} label={t} />)}</Tabs>
      {tab === 0 ? (
        <Stack sx={{ gap: 2 }}>
          <SectionCard title="Position by dimension" actions={<Legend />}>
            <Stack sx={{ gap: 1 }}>
              {DIMENSIONS.map((d) => (
                <Stack key={d} direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <ConditionChip condition={pos[d]} label={d.charAt(0).toUpperCase() + d.slice(1)} />
                  <Typography variant="body2">Set by: {contributingProjects(prjs, d, pos[d]).map((p) => p.name).join(', ')}</Typography>
                </Stack>
              ))}
              {missing.length ? <Typography variant="body2" sx={{ color: 'condition.attention', fontWeight: 600 }}>{missing.length} project{missing.length === 1 ? '' : 's'} with stale or missing information: {missing.map((p) => p.name).join(', ')}. This gap is part of the assessment.</Typography> : null}
            </Stack>
          </SectionCard>
          <SectionCard title={`Material findings (${fnds.length})`}><FindingsList findings={fnds} onOpen={(f) => openFinding(f)} /></SectionCard>
        </Stack>
      ) : null}
      {tab === 1 ? <SectionCard title="Combined milestone and commitment timeline" dense><CommitmentTimeline commitments={(commitments.data ?? []).filter((c) => ids.includes(c.projectId))} /></SectionCard> : null}
      {tab === 2 ? <SectionCard title="Contributing projects" dense><PortfolioMatrix programmes={[pg]} projects={prjs} findings={fnds} grouping="programme" onOpenFinding={(f) => openFinding(f)} was={NO_CHANGES} comparisonWeek="" /></SectionCard> : null}
      {tab === 3 ? <SectionCard title="Shared constraints, hand-offs and external dependencies" dense><DependencyList query={{ scope: pg.id, owner: '', type: '' }} nodes={nodes.data ?? []} selectedId={focus || null} onSelect={(d) => setFocus(d)} />{focus ? <Typography variant="body2" sx={{ mt: 1 }}>Affected commitments: {(deps.data ?? []).find((d) => d.id === focus)?.affectedCommitmentIds.join(', ') || 'none recorded'}. <Button size="small" onClick={() => navigate(`/dependencies?focus=${focus}`)}>Open in graph</Button></Typography> : null}</SectionCard> : null}
      {tab === 4 ? <SectionCard title="Capabilities delivered through the programme" dense><ReleaseRows releases={(releases.data ?? []).filter((r) => ids.includes(r.projectId))} /></SectionCard> : null}
      {tab === 5 ? <SectionCard title="Programme budget, expenditure, forecast and outcome evidence">{costs.isError || outcomes.isError ? <ErrorState message="Cost or outcome records could not be loaded." onRetry={() => { void costs.refetch(); void outcomes.refetch(); }} /> : !costs.data || !outcomes.data ? <LoadingState rows={4} /> : <CostOutcomePanel projectIds={ids} costs={costs.data ?? []} outcomes={outcomes.data ?? []} funding={pg.funding} attributionNote="Shared expenditure and benefits need an attribution rule before they enter programme totals." />}</SectionCard> : null}
      {tab === 6 ? <SectionCard title="Programme conclusions, actions and changes"><DecisionsHistory decisions={(decisions.data ?? []).filter((d) => fnds.some((f) => f.id === d.findingId))} actions={(actions.data ?? []).filter((a) => fnds.some((f) => f.id === a.findingId))} findings={fnds} onOpenFinding={(f) => openFinding(f)} /></SectionCard> : null}
    </>
  );
}
