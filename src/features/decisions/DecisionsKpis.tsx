import Grid from '@mui/material/Grid';
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { KpiTile } from '@/shared/components/ui/KpiTile';
import { useWorkCounts } from './useWorkCounts';

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/** Four counts straight from the records the tables list; the "mine" switch narrows them the same way. */
export function DecisionsKpis({ owner }: { owner: string | undefined }) {
  const { counts, isError, retry } = useWorkCounts(owner);
  if (isError) return <ErrorState message="The counts for this page could not be loaded." onRetry={retry} />;
  if (!counts) return <LoadingState rows={2} />;
  const who = owner ? 'Assigned to you' : 'Everyone in scope';
  const overdueShare = counts.openActions ? (counts.overdue / counts.openActions) * 100 : 0;
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiTile label="Responses required" value={String(counts.responses)} icon={<AssignmentLateOutlinedIcon />} iconTone={counts.responses ? 'warning' : 'navy'}
          footer={`${who}. No response against the current version.`} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiTile label="Clarifications open" value={String(counts.clarifications)} icon={<HelpOutlineIcon />} iconTone={counts.clarifications ? 'warning' : 'navy'}
          footer={`${who}. Awaiting the named owner's answer.`} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiTile label="Decisions this period" value={String(counts.decisions)} icon={<GavelOutlinedIcon />}
          footer={counts.since ? `Recorded since the ${counts.since}.` : 'All recorded decisions in scope.'} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiTile label="Actions overdue" value={String(counts.overdue)} icon={<EventBusyOutlinedIcon />} iconTone={counts.overdue ? 'danger' : 'navy'}
          footer={`Of ${plural(counts.openActions, 'open action')}. ${who}.`} progress={overdueShare} progressTone="danger" />
      </Grid>
    </Grid>
  );
}
