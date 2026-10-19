import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import type { Source, SourceIssue } from '@/shared/types/domain';
import { IssueActions } from './IssueActions';
import { RetryIngestionButton } from './RetryIngestionButton';
import { issueKind, issueStatus, KIND_LABEL, STATUS_TONE } from './sourceIssues';

/** The reported problem and its recorded resolution, kept apart from any action still to take. */
export function IssueDetail({ source, issue }: { source: Source; issue: SourceIssue }) {
  const status = issueStatus(issue);
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: status !== 'resolved' ? 7 : 12 }}>
        <SectionCard title={`Selected problem ${issue.id}`} subtitle={source.name} sx={{ height: '100%' }}>
          <Stack sx={{ gap: 1.5 }}>
            <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
              <StatusChip tone="neutral" square dot={false}>{KIND_LABEL[issueKind(issue)]}</StatusChip>
              <StatusChip tone={STATUS_TONE[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</StatusChip>
            </Stack>
            <Typography variant="subtitle1">{issue.description}</Typography>
            <KeyValueList columns={2} items={[
              { label: 'Raised', value: issue.raised ? formatDate(issue.raised) : 'Not recorded' },
              { label: 'Affected records', value: issue.affectedRecords.join(', ') || 'None recorded' },
              { label: 'Missing or conflicting values', value: issue.conflictingValues ?? 'Missing value' },
              { label: 'Field authority', value: issue.fieldAuthority ?? `${source.name} is authoritative for ${source.authoritativeFields.join(', ')}` },
              { label: 'Relevant source dates', value: `Last refresh ${source.lastRefresh}; cadence ${source.cadence}` },
              { label: 'Downstream findings and reports affected', value: issue.downstream.join('; ') || 'None recorded' },
              { label: 'Reconciliation owner', value: issue.reconciliationOwner },
            ]} />
            {issue.resolution ? (
              <Box sx={(t) => ({ p: 1.5, borderRadius: 1, bgcolor: t.palette.tint.success.bg, borderLeft: `3px solid ${t.palette.tint.success.fg}` })}>
                <Typography variant="overline" component="p" sx={(t) => ({ color: t.palette.tint.success.fg })}>Recorded resolution</Typography>
                <Typography variant="body2">{issue.resolution.decision}</Typography>
                <Typography variant="caption">Recorded by {issue.resolution.by} on {formatDate(issue.resolution.date)}</Typography>
              </Box>
            ) : null}
            <RetryIngestionButton source={source} />
          </Stack>
        </SectionCard>
      </Grid>
      {status !== 'resolved' ? (
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Resolve this issue" subtitle="Each decision is recorded with its own type and provenance." sx={{ height: '100%' }}>
            <IssueActions key={issue.id} source={source} issue={issue} />
          </SectionCard>
        </Grid>
      ) : null}
    </Grid>
  );
}
