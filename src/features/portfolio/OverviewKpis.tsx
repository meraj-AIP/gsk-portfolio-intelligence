import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import Grid from '@mui/material/Grid';
import { useCostRecords, useOutcomeMeasures } from '@/shared/api/hooks';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { KpiTile } from '@/shared/components/ui/KpiTile';
import { gbpShort } from '@/shared/lib/format';
import { costSummary } from '@/shared/lib/portfolio';
import { allGatesPassed, pendingGates } from './OverviewModel';
import { usePanelHref } from './OverviewLinks';
import type { PortfolioView } from './usePortfolioView';

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '-' : ''}${gbpShort(Math.abs(n))}`;

/** Four headline figures. Each is counted from records in scope and links to the place that shows the same records. */
export function OverviewKpis({ view }: { view: PortfolioView }) {
  const href = usePanelHref();
  const costs = useCostRecords();
  const outcomes = useOutcomeMeasures();
  if (costs.isError || outcomes.isError) return <ErrorState message="Cost or outcome records could not be loaded." onRetry={() => { void costs.refetch(); void outcomes.refetch(); }} />;
  if (!costs.data || !outcomes.data) return <LoadingState rows={2} />;

  const { projects, findings } = view;
  const ids = projects.map((p) => p.id);
  const n = projects.length;
  const live = projects.filter((p) => p.stage === 'Live' || p.stage === 'Scaling').length;
  const onCommitment = projects.filter((p) => p.position.delivery === 'met').length;
  const cost = costSummary(costs.data, ids);
  const over = cost.forecast > cost.budget;
  const vetted = projects.filter(allGatesPassed).length;
  const pending = projects.reduce((s, p) => s + pendingGates(p), 0);
  const governance = findings.find((f) => f.category === 'governance');
  const measures = outcomes.data.filter((m) => ids.includes(m.projectId));
  const measured = measures.filter((m) => m.actual).length;
  const programme = view.programmes.length === 1 ? view.programmes[0] : undefined;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiTile
          label="Active projects" value={String(n)} unit={`live or scaling: ${live}`} icon={<RocketLaunchOutlinedIcon />}
          footer={`On current commitment: ${onCommitment} of ${n}`} progress={pct(onCommitment, n)} progressTone="success"
          to={programme ? `/directory?programme=${programme.id}` : '/directory'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiTile
          label="Forecast spend" value={gbpShort(cost.forecast)} unit={`of ${gbpShort(cost.budget)} budget`} icon={<AccountBalanceWalletOutlinedIcon />}
          iconTone={over ? 'warning' : 'navy'}
          footer={`Variance ${signed(cost.variance)}. Shared cost of ${gbpShort(cost.sharedExcluded)} excluded`}
          progress={pct(cost.forecast, cost.budget)} progressTone={over ? 'warning' : 'navy'}
          to={programme ? `/programmes/${programme.id}` : '/briefing'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiTile
          label="Governance vetting" value={`${vetted} of ${n}`} unit="all gates passed" icon={<VerifiedUserOutlinedIcon />}
          footer={`${pending} gate${pending === 1 ? '' : 's'} not yet passed`} progress={pct(vetted, n)} progressTone="navy"
          to={governance ? href({ finding: governance.id }) : '/directory'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiTile
          label="Benefits measured" value={`${measured} of ${measures.length}`} unit="outcome measures" icon={<InsightsOutlinedIcon />}
          footer={`${measures.length - measured} still forecast, never added together`} progress={pct(measured, measures.length)} progressTone="accent"
          to={programme ? `/programmes/${programme.id}` : '/briefing'}
        />
      </Grid>
    </Grid>
  );
}
