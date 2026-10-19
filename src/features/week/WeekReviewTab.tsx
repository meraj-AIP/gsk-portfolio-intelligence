import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useReview } from '@/app/context/ReviewContext';
import { useConclusions, useDependencies, useLifecycles, useSnapshots } from '@/shared/api/hooks';
import { SectionCard } from '@/shared/components/SectionCard';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import type { Snapshot } from '@/shared/types/governance';
import { DiscussionQueue } from './DiscussionQueue';
import { NextPeriod } from './NextPeriod';
import { PastReviews } from './PastReviews';
import { ResponsivePanel } from './ResponsivePanel';
import { SelectedItemPanel } from './SelectedItemPanel';
import { useWeekQueue } from './useWeekQueue';
import { WeekTimeline } from './WeekTimeline';
import { weekLabel, type QueueItem, type ReviewPeriod } from './weekModel';

type Props = { review: Snapshot; period: ReviewPeriod; meetingView: boolean };

/** The timeline tab: what happened in the week, the discussion queue with last week's context, and what comes next. */
export function WeekReviewTab({ review, period, meetingView }: Props) {
  const { isReadOnly } = useReview();
  const { items, ids, data, isError, retry } = useWeekQueue(period);
  const deps = useDependencies();
  const snapshots = useSnapshots();
  const conclusions = useConclusions();
  const lifecycles = useLifecycles();
  const [selected, setSelected] = useUrlParam('item');
  const [, openFinding] = useUrlParam('finding');

  if (isError) return <ErrorState message="The weekly review could not be loaded." onRetry={retry} />;
  if (!data) return <LoadingState rows={8} />;

  const item = items.find((i) => i.id === selected) ?? null;
  // Anything tied to a finding continues in the finding journey, which already holds its history, responses and actions.
  const select = (it: QueueItem) => (it.findingId ? openFinding(it.findingId) : setSelected(it.id));
  const label = weekLabel(review.week);

  return (
    <>
      {isReadOnly ? <Alert severity="info" sx={{ mb: 2 }}>You are viewing a closed review. It is read only; corrections go in as amendments under Past reviews.</Alert> : null}
      {items.length === 0 ? <Alert severity="info" sx={{ mb: 2 }}>Nothing recorded for {label.toLowerCase()} in this portfolio yet.</Alert> : null}
      {conclusions.isError || lifecycles.isError ? <Alert severity="warning" sx={{ mb: 2 }}>Earlier conclusions or finding stages could not be loaded, so carried-forward context is incomplete.</Alert> : null}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: meetingView ? 5 : 8 }}>
          <Stack sx={{ gap: 3 }}>
            {!meetingView ? (
              <SectionCard title="Weekly delivery timeline" subtitle="Each mark is a recorded event, placed on the day it happened." badge={`${items.length} items`}>
                <WeekTimeline items={items} period={period} selectedId={selected || null} onSelect={select} />
              </SectionCard>
            ) : null}
            <Stack sx={{ gap: 1.5 }}>
              <Typography variant="h2">Discussion queue</Typography>
              <DiscussionQueue items={items} period={period} selectedId={selected || null} onSelect={select} week={review.week} conclusions={conclusions.data ?? []} lifecycles={lifecycles.data ?? {}} />
            </Stack>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, lg: meetingView ? 7 : 4 }}>
          <Stack sx={{ gap: 3 }}>
            <ResponsivePanel title={meetingView ? 'Discussing now' : 'Selected item'} open={Boolean(item)} onClose={() => setSelected(null)} placeholder="Select a timeline event or a queue item. Items with a finding open its journey.">
              {item ? <SelectedItemPanel item={item} period={period} enlarged={meetingView} week={review.week} readOnly={isReadOnly} /> : null}
            </ResponsivePanel>
            <NextPeriod commitments={data.commitments} dependencies={deps.data} dependenciesFailed={deps.isError} projectIds={ids} period={period} />
          </Stack>
        </Grid>
        <Grid size={12}>
          {snapshots.data ? <PastReviews snapshots={snapshots.data} /> : null}
        </Grid>
      </Grid>
    </>
  );
}
