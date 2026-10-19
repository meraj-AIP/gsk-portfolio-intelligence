import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useParams, useSearchParams } from 'react-router-dom';
import { useBriefingTray } from '@/app/context/BriefingTrayContext';
import { useAllProjects, useFindings, useProgramme } from '@/shared/api/hooks';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { DomainTag } from '@/shared/components/ui/StatusChip';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { CONDITION_SHORT, formatDate } from '@/shared/lib/format';
import { BusinessContribution } from './BusinessContribution';
import { worstAcross } from './directoryModel';
import { FactStrip } from './FactStrip';
import { ProgrammeKpis } from './ProgrammeKpis';
import { ProgrammeStageTrack } from './ProgrammeStageTrack';
import { PROGRAMME_TABS, ProgrammeTabs } from './ProgrammeTabs';
import { RequestResponseButton } from './RequestResponseButton';
import { SinceReviewStrip } from './SinceReviewStrip';

/** S05. The programme's business purpose and how its projects are delivering it. */
export function ProgrammePage() {
  const { id = '' } = useParams();
  const programme = useProgramme(id);
  const projects = useAllProjects();
  const findings = useFindings();
  const tray = useBriefingTray();
  const [, setParams] = useSearchParams();
  const [tabRaw, setTab] = useUrlParam('tab');
  const tab = Number(tabRaw || 0);

  if (programme.isError || projects.isError || findings.isError) return <ErrorState message="Programme could not be loaded." onRetry={() => { void programme.refetch(); void projects.refetch(); void findings.refetch(); }} />;
  if (programme.isLoading || !projects.data || !findings.data) return <LoadingState rows={8} />;
  const pg = programme.data;
  if (!pg) return <EmptyState title="Programme not found" />;
  const prjs = projects.data.filter((p) => p.programmeId === pg.id);
  const ids = prjs.map((p) => p.id);
  const fnds = findings.data.filter((f) => f.affectedIds.some((a) => ids.includes(a) || a === pg.id));
  const material = fnds.find((f) => f.persistent) ?? fnds[0];
  const worst = prjs.length ? worstAcross(prjs) : 'unknown';
  // Ask opens beside the record rather than on its own page, so the question keeps its context.
  const ask = () => setParams((prev) => { const next = new URLSearchParams(prev); next.set('ask', pg.id); next.set('q', 'What changed against the previous commitment?'); return next; }, { replace: true });

  return (
    <>
      <PageHeader
        eyebrow={<><DomainTag strong>{pg.businessArea}</DomainTag><ConditionChip condition={worst} label={`Worst position: ${CONDITION_SHORT[worst]}`} /></>}
        title={pg.name} subtitle={pg.objective}
        actions={<>
          <Button variant="outlined" onClick={ask}>Ask about this programme</Button>
          {material ? <RequestResponseButton findingId={material.id} defaultOwner={material.requestedOwner ?? pg.lead} /> : null}
          <Button variant="contained" color="secondary" disabled={tray.has(pg.id)} onClick={() => tray.add(pg.id)}>{tray.has(pg.id) ? 'In briefing' : 'Add to briefing'}</Button>
        </>}
        meta={<FactStrip items={[
          { label: 'Sponsor', value: <AvatarName name={pg.sponsor} size={24} /> },
          { label: 'Programme lead', value: <AvatarName name={pg.lead} size={24} /> },
          { label: 'Reporting date', value: formatDate(pg.reportingDate) },
          { label: 'Current assessment', value: pg.assessment },
          { label: 'Next required decision', value: pg.nextDecision },
          { label: 'Funding', value: pg.funding.map((f) => `${f.businessUnit} ${f.percent}%`).join('; ') },
        ]} />}
      />
      <BusinessContribution programmeId={pg.id} />
      <ProgrammeKpis projects={prjs} findings={fnds} />
      <ProgrammeStageTrack programmeId={pg.id} projects={prjs} />
      <SinceReviewStrip findings={fnds} projects={prjs} />
      <Tabs value={tab} onChange={(_, v: number) => setTab(String(v))} variant="scrollable" sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>{PROGRAMME_TABS.map((t) => <Tab key={t} label={t} />)}</Tabs>
      <ProgrammeTabs tab={tab} programme={pg} projects={prjs} findings={fnds} />
    </>
  );
}
