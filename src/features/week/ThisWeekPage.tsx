import ForumIcon from '@mui/icons-material/Forum';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TimelineIcon from '@mui/icons-material/Timeline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useReview } from '@/app/context/ReviewContext';
import { useSnapshots } from '@/shared/api/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { SegmentedToggle } from '@/shared/components/ui/Controls';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { CloseReviewButton } from './CloseReviewButton';
import { ReleasesView } from './ReleasesView';
import { WeekKpis } from './WeekKpis';
import { WeekReviewTab } from './WeekReviewTab';
import { reviewPeriod, shortDate, weekLabel } from './weekModel';

const TABS = [
  { value: 'timeline', label: 'Timeline and discussion', icon: <TimelineIcon /> },
  { value: 'releases', label: 'Releases', icon: <RocketLaunchIcon /> },
];

/** S02. Prepares and supports the weekly delivery discussion, with this week's releases as a second tab. */
export function ThisWeekPage() {
  const { viewSnapshot, comparisonSnapshot, isReadOnly } = useReview();
  const snapshots = useSnapshots();
  const [tabParam, setTab] = useUrlParam('tab');
  const tab = tabParam === 'releases' ? 'releases' : 'timeline';
  const [meetingView, setMeetingView] = useState(false);

  // The open snapshot decides which week is under review, so closing it moves the page on. A past review chosen in the header is shown read only.
  const review = (isReadOnly ? viewSnapshot : undefined) ?? snapshots.data?.find((s) => s.status === 'open');
  const openWeek = review?.week;
  const openDate = review?.date;
  const period = useMemo(() => (openWeek && openDate ? reviewPeriod({ week: openWeek, date: openDate }) : null), [openWeek, openDate]);

  if (snapshots.isError) return <ErrorState message="The weekly review could not be loaded." onRetry={() => void snapshots.refetch()} />;
  if (!snapshots.data) return <LoadingState rows={8} />;
  if (!review || !period) return <EmptyState title="No review is open" hint="A new weekly review opens when the previous one is closed." />;

  const label = weekLabel(review.week);
  const open = !isReadOnly && review.status === 'open';
  return (
    <>
      <PageHeader
        eyebrow={<>
          {open ? <StatusChip tone="success">Review open</StatusChip> : <StatusChip tone="neutral">Review {review.status}, read only</StatusChip>}
          <Typography variant="overline">Review period {shortDate(period.start)} to {shortDate(period.end)}, {label.toLowerCase()}</Typography>
        </>}
        title="This week"
        subtitle="Items keep their identity when carried forward, so last week's context does not need rebuilding."
        actions={<>
          <SegmentedToggle label="This week views" options={TABS} value={tab} onChange={(v) => setTab(v === 'releases' ? 'releases' : null)} />
          {tab === 'timeline' ? <Button variant={meetingView ? 'contained' : 'outlined'} startIcon={<ForumIcon />} onClick={() => setMeetingView((v) => !v)}>{meetingView ? 'Exit meeting view' : 'Meeting view'}</Button> : null}
          {isReadOnly ? null : <CloseReviewButton open={review} />}
        </>}
        meta={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="overline">Snapshot</Typography>
            <StatusChip tone="neutral" dot={false} square>{review.label}</StatusChip>
            <Typography variant="overline" sx={{ ml: 1 }}>Compared with</Typography>
            <StatusChip tone="neutral" dot={false} square>{comparisonSnapshot?.label ?? 'None selected'}</StatusChip>
          </Box>
        } />
      <WeekKpis period={period} />
      <div role="tabpanel" aria-label={tab === 'releases' ? 'Releases' : 'Timeline and discussion'}>
        {tab === 'releases' ? <ReleasesView /> : <WeekReviewTab review={review} period={period} meetingView={meetingView} />}
      </div>
    </>
  );
}
