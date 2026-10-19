import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/features/auth/AuthContext';
import { useSources } from '@/shared/api/hooks';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { can } from '@/shared/lib/permissions';
import { CoverageMap } from './CoverageMap';
import { IssueDetail } from './IssueDetail';
import { SourceTable } from './SourceTable';

/** Connection health and content quality per source, with the selected problem beside the table. */
export function SourcesTab() {
  const { user } = useAuth();
  const sources = useSources();
  const [issueId, setIssueId] = useUrlParam('issue');
  if (sources.isError) return <ErrorState message="Sources could not be loaded." onRetry={() => void sources.refetch()} />;
  if (!sources.data) return <LoadingState rows={8} />;
  const ownerView = user?.role === 'Reporting or data owner' && !can(user, 'view all sources');
  const selected = sources.data.flatMap((s) => s.issues.map((i) => ({ source: s, issue: i }))).find((x) => x.issue.id === issueId) ?? null;

  return (
    <>
      {ownerView ? <Alert severity="info" sx={{ mb: 2 }}>Showing the sources you own.</Alert> : null}
      {sources.data.length === 0 ? <EmptyState title="No sources to show" hint={ownerView ? 'No sources are assigned to you yet.' : 'Sources appear here once they are connected.'} /> : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <SectionCard title="Sources" dense><SourceTable sources={sources.data} selectedIssueId={issueId} onSelect={setIssueId} /></SectionCard>
            <SectionCard title="Coverage map" sx={{ mt: 2 }}><CoverageMap sources={sources.data} /></SectionCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <SectionCard title="Selected problem">
              {selected ? <IssueDetail source={selected.source} issue={selected.issue} />
                : <Typography variant="body2" sx={{ color: 'text.secondary' }}>Select an issue to see affected records, conflicting values, field authority, downstream effects and any recorded resolution. Inconsistencies flagged on evidence appear here too.</Typography>}
            </SectionCard>
          </Grid>
        </Grid>
      )}
    </>
  );
}
