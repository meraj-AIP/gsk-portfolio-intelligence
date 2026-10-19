import Grid from '@mui/material/Grid';
import CompareArrowsOutlinedIcon from '@mui/icons-material/CompareArrowsOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import { KpiTile } from '@/shared/components/ui/KpiTile';
import { formatDate } from '@/shared/lib/format';
import type { Source } from '@/shared/types/domain';
import { issueKind, issueStatus, openIssues } from './sourceIssues';

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;
const day = (stamp: string) => formatDate(stamp).replace(/ \d{4}$/, '');

/** Four counts from the visible source records; a data owner sees counts for their own sources only. */
export function SourcesKpis({ sources }: { sources: Source[] }) {
  const healthy = sources.filter((s) => s.connectionHealth === 'healthy').length;
  const degraded = sources.filter((s) => s.connectionHealth === 'degraded').length;
  const failed = sources.filter((s) => s.connectionHealth === 'failed').length;
  const open = openIssues(sources);
  const awaitingSource = open.filter((i) => issueStatus(i) === 'correction requested').length;
  const conflicts = open.filter((i) => issueKind(i) === 'conflict').length;
  const conflicted = sources.filter((s) => s.contentQuality === 'conflicts').length;
  const byRefresh = [...sources].sort((a, b) => b.lastRefresh.localeCompare(a.lastRefresh));
  const latest = byRefresh[0];
  const oldest = byRefresh.at(-1);
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiTile label="Sources healthy" value={String(healthy)} unit={`of ${sources.length}`} icon={<StorageOutlinedIcon />} iconTone={healthy === sources.length ? 'success' : 'warning'}
          footer={`${degraded} degraded, ${failed} failed connection${failed === 1 ? '' : 's'}.`} progress={sources.length ? (healthy / sources.length) * 100 : 0} progressTone="success" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiTile label="Open issues" value={String(open.length)} icon={<ReportProblemOutlinedIcon />} iconTone={open.length ? 'warning' : 'navy'}
          footer={`${awaitingSource} awaiting correction at source.`} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiTile label="Conflicts" value={String(conflicts)} icon={<CompareArrowsOutlinedIcon />} iconTone={conflicts ? 'danger' : 'navy'}
          footer={`Open conflicting values. ${plural(conflicted, 'source')} with conflicting content.`} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <KpiTile label="Last refresh" value={latest ? day(latest.lastRefresh) : 'None'} unit={latest?.lastRefresh.split(' ')[1]} icon={<UpdateOutlinedIcon />}
          footer={latest ? `${latest.name}. Oldest: ${oldest?.name}, ${day(oldest?.lastRefresh ?? '')}.` : 'No source has refreshed yet.'} />
      </Grid>
    </Grid>
  );
}
