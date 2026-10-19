import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { formatDate } from '@/shared/lib/format';
import type { Source, SourceIssue } from '@/shared/types/domain';
import { IssueActions } from './IssueActions';
import { RetryIngestionButton } from './RetryIngestionButton';
import { issueKind, issueStatus, KIND_LABEL, STATUS_COLOR } from './sourceIssues';

/** The reported problem and its recorded resolution, kept apart from any action still to take. */
export function IssueDetail({ source, issue }: { source: Source; issue: SourceIssue }) {
  const status = issueStatus(issue);
  return (
    <Stack sx={{ gap: 1.25 }}>
      <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
        <Chip label={KIND_LABEL[issueKind(issue)]} size="small" variant="outlined" />
        <Chip label={status} size="small" color={STATUS_COLOR[status]} variant="outlined" />
      </Stack>
      <Typography variant="subtitle1">{issue.description}</Typography>
      <KeyValueList columns={1} items={[
        { label: 'Source', value: source.name },
        { label: 'Raised', value: issue.raised ? formatDate(issue.raised) : 'Not recorded' },
        { label: 'Affected records', value: issue.affectedRecords.join(', ') || 'None recorded' },
        { label: 'Missing or conflicting values', value: issue.conflictingValues ?? 'Missing value' },
        { label: 'Field authority', value: issue.fieldAuthority ?? `${source.name} is authoritative for ${source.authoritativeFields.join(', ')}` },
        { label: 'Relevant source dates', value: `Last refresh ${source.lastRefresh}; cadence ${source.cadence}` },
        { label: 'Downstream findings and reports affected', value: issue.downstream.join('; ') || 'None recorded' },
        { label: 'Reconciliation owner', value: issue.reconciliationOwner },
      ]} />
      {issue.resolution ? (
        <Stack sx={{ p: 1.25, border: 1, borderColor: 'success.main', borderRadius: 0.5, gap: 0.5 }}>
          <Typography variant="caption">Resolution</Typography>
          <Typography variant="body2">{issue.resolution.decision}</Typography>
          <Typography variant="caption">Recorded by {issue.resolution.by} on {formatDate(issue.resolution.date)}</Typography>
        </Stack>
      ) : null}
      <RetryIngestionButton source={source} />
      {status !== 'resolved' ? <IssueActions key={issue.id} source={source} issue={issue} /> : null}
    </Stack>
  );
}
