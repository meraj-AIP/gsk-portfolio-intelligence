import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useReview } from '@/app/context/ReviewContext';
import { usePendingUpdate, useRefreshSnapshot } from '@/shared/api/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { can } from '@/shared/lib/permissions';
import { useAuth } from '@/features/auth/AuthContext';
import { ConstraintsView } from '@/features/portfolio/ConstraintsView';
import { OverviewActions, OverviewEyebrow, OverviewMeta } from './OverviewHeader';
import { listOf } from './OverviewModel';
import { OverviewTab } from './OverviewTab';
import { usePortfolioView, type PortfolioView } from './usePortfolioView';

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/** Built from the scoped records, so the sentence changes with the programme filter. */
function subtitle({ projects, programmes }: PortfolioView): string {
  const areas = [...new Set(programmes.map((p) => p.businessArea))];
  return `Tracking ${plural(projects.length, 'project')} across ${plural(programmes.length, 'programme')}${areas.length ? ` in ${listOf(areas)}` : ''}`;
}

/** S01. Portfolio overview and its constraints, both read from the review selected in the review bar. */
export function PortfolioPage() {
  const { user } = useAuth();
  const { isReadOnly } = useReview();
  const view = usePortfolioView();
  const pending = usePendingUpdate();
  const refresh = useRefreshSnapshot();
  const [tab, setTab] = useUrlParam('tab');
  const current = tab === 'constraints' ? 'constraints' : 'overview';

  return (
    <>
      <PageHeader
        eyebrow={<OverviewEyebrow />}
        title="AI and data portfolio overview"
        subtitle={view.status === 'ready' ? subtitle(view) : undefined}
        actions={<OverviewActions />}
        meta={<OverviewMeta />}
      />
      {pending.data && !isReadOnly ? (
        <Alert severity="info" sx={{ mb: 3 }} action={can(user, 'refresh snapshot') ? <Button color="inherit" onClick={() => refresh.mutate()} disabled={refresh.isPending}>{refresh.isPending ? 'Refreshing' : 'Refresh snapshot'}</Button> : undefined}>
          New information arrived after this snapshot was taken. The view stays on the current snapshot until you refresh.
        </Alert>
      ) : null}
      {refresh.error ? <Alert severity="error" sx={{ mb: 3 }}>{refresh.error.message}</Alert> : null}
      <Tabs value={current} onChange={(_, v: string) => setTab(v === 'overview' ? null : v)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }} aria-label="Portfolio views">
        <Tab value="overview" label="Overview" />
        <Tab value="constraints" label="Constraints" />
      </Tabs>
      {current === 'constraints' ? <ConstraintsView />
        : view.status === 'ready' ? <OverviewTab view={view} />
        : view.status === 'error' ? <ErrorState message="The portfolio snapshot could not be loaded." onRetry={view.retry} />
        : <LoadingState rows={8} />}
    </>
  );
}
