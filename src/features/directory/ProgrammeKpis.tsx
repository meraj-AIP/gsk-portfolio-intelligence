import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import Box from '@mui/material/Box';
import { useCostRecords, useLifecycles, useOutcomeMeasures } from '@/shared/api/hooks';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { KpiTile } from '@/shared/components/ui/KpiTile';
import { gbpShort } from '@/shared/lib/format';
import { costSummary } from '@/shared/lib/portfolio';
import type { Finding, Project } from '@/shared/types/domain';

const pct = (part: number, whole: number) => (whole ? (part / whole) * 100 : 0);

/** Four calculated figures from the programme's own records. Outcomes are counted, never summed, because their units differ. */
export function ProgrammeKpis({ projects, findings }: { projects: Project[]; findings: Finding[] }) {
  const costs = useCostRecords();
  const outcomes = useOutcomeMeasures();
  const lifecycles = useLifecycles();
  if (costs.isError || outcomes.isError) return <ErrorState message="Programme figures could not be calculated." onRetry={() => { void costs.refetch(); void outcomes.refetch(); }} />;
  if (!costs.data || !outcomes.data) return <LoadingState rows={2} />;
  const ids = projects.map((p) => p.id);
  const onTrack = projects.filter((p) => p.position.delivery === 'met').length;
  const breached = projects.filter((p) => p.position.delivery === 'breached').length;
  const c = costSummary(costs.data, ids);
  const over = c.variance > 0;
  const measures = outcomes.data.filter((o) => ids.includes(o.projectId));
  const measured = measures.filter((o) => o.actual).length;
  // Open means not yet resolved by verified actions; the lifecycle is the single source for that.
  const open = findings.filter((f) => lifecycles.data?.[f.id]?.stage !== 'resolved');
  const persistent = open.filter((f) => f.persistent).length;
  return (
    <Box sx={{ display: 'grid', gap: 3, mb: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' } }}>
      <KpiTile label="Projects on commitment" value={String(onTrack)} unit={`of ${projects.length}`} icon={<FlagOutlinedIcon fontSize="small" />}
        footer={breached ? `${breached} breached, ${projects.length - onTrack - breached} other` : `${projects.length - onTrack} not yet met`}
        progress={pct(onTrack, projects.length)} progressTone="success" />
      <KpiTile label="Forecast against budget" value={gbpShort(c.forecast)} unit={`of ${gbpShort(c.budget)}`}
        delta={{ text: `${over ? '+' : ''}${gbpShort(c.variance)}`, tone: over ? 'danger' : 'success' }}
        icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />} iconTone={over ? 'warning' : 'navy'}
        footer={`Direct costs, FY26. Coverage ${c.coverage} of ${c.of} projects.`} progress={pct(c.forecast, c.budget)} progressTone={over ? 'danger' : 'navy'} />
      <KpiTile label="Measured benefits" value={String(measured)} unit={`of ${measures.length} measures`} icon={<InsightsOutlinedIcon fontSize="small" />} iconTone="success"
        footer={`${measures.length - measured} still a forecast. Counted, not summed.`} progress={pct(measured, measures.length)} progressTone="success" />
      <KpiTile label="Open findings" value={String(open.length)} unit={`of ${findings.length}`} icon={<ReportProblemOutlinedIcon fontSize="small" />} iconTone={open.length ? 'accent' : 'neutral'}
        footer={persistent ? `${persistent} persisting across reviews` : 'None persisting across reviews'} />
    </Box>
  );
}
