import GavelIcon from '@mui/icons-material/Gavel';
import RedoIcon from '@mui/icons-material/Redo';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { ErrorState } from '@/shared/components/StatePanels';
import { KpiTile } from '@/shared/components/ui/KpiTile';
import { isAvailable } from './releaseFilterModel';
import { useWeekQueue } from './useWeekQueue';
import { weekLabel, type ReviewPeriod } from './weekModel';

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

/** Four counts for the week under review, each read from the same queue the discussion uses, so the tiles and the list agree. */
export function WeekKpis({ period }: { period: ReviewPeriod }) {
  const { items, ids, data, isError, retry } = useWeekQueue(period);
  const grid = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 3 };

  if (isError) return <Box sx={{ mb: 3 }}><ErrorState message="The week's counts could not be loaded." onRetry={retry} /></Box>;
  if (!data) return <Box sx={grid}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={132} />)}</Box>;

  const due = data.commitments.filter((c) => c.week === period.week && ids.includes(c.projectId)).length;
  const completed = items.filter((i) => i.group === 'Commitments completed or progressed').length;
  const weekReleases = data.releases.filter((r) => r.week === period.week && ids.includes(r.projectId));
  const available = weekReleases.filter(isAvailable).length;
  const decisions = items.filter((i) => i.group === 'Decisions and responses required');
  const overdue = decisions.filter((i) => i.responseDue && i.responseDue < period.end).length;
  const carried = items.filter((i) => i.group === 'Items carried forward');
  const oldest = carried.map((i) => i.openSince).filter((w): w is string => Boolean(w)).sort()[0];

  return (
    <Box sx={grid}>
      <KpiTile label="Commitments completed" value={String(completed)} unit={`of ${due} due`} icon={<TaskAltIcon />}
        footer={due ? `${pct(completed, due)}% of this week's recorded commitments` : 'No commitments due this week'} progress={pct(completed, due)} />
      <KpiTile label="Releases made available" value={String(available)} unit={`of ${weekReleases.length} recorded`} icon={<RocketLaunchIcon />}
        footer={weekReleases.length ? `${weekReleases.length - available} not yet available to the business` : 'No releases recorded this week'} progress={pct(available, weekReleases.length)} progressTone="success" />
      <KpiTile label="Decisions and responses" value={String(decisions.length)} unit="required" icon={<GavelIcon />} iconTone={overdue ? 'danger' : decisions.length ? 'warning' : 'neutral'}
        footer={overdue ? `${overdue} owner response${overdue === 1 ? '' : 's'} overdue` : 'No owner response overdue'} />
      <KpiTile label="Items carried forward" value={String(carried.length)} icon={<RedoIcon />} iconTone="neutral"
        footer={oldest ? `Oldest open since ${weekLabel(oldest).toLowerCase()}` : carried.length ? 'All first due this week' : 'Nothing carried from earlier weeks'} />
    </Box>
  );
}
