import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/features/auth/AuthContext';
import { MatrixCard } from '@/shared/components/ui/MatrixCard';
import { useSources } from '@/shared/api/hooks';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { can } from '@/shared/lib/permissions';
import { CoverageMap } from './CoverageMap';
import { IssueDetail } from './IssueDetail';
import { SourcesKpis } from './SourcesKpis';
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
  if (sources.data.length === 0) return <EmptyState title="No sources to show" hint={ownerView ? 'No sources are assigned to you yet.' : 'Sources appear here once they are connected.'} />;

  return (
    <Stack sx={{ gap: 3 }}>
      {ownerView ? <Alert severity="info">Showing the sources you own.</Alert> : null}
      <SourcesKpis sources={sources.data} />
      <MatrixCard title="Source matrix" subtitle="What each source supplies, who owns it and which fields it is authoritative for. Select an issue to work on it.">
        <SourceTable sources={sources.data} selectedIssueId={issueId} onSelect={setIssueId} />
      </MatrixCard>
      {selected ? <IssueDetail source={selected.source} issue={selected.issue} /> : (
        <SectionCard title="Selected problem">
          <Paper variant="outlined" sx={(t) => ({ p: 2, bgcolor: t.palette.brand.canvas, boxShadow: 'none', borderStyle: 'dashed' })}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Select an issue in the matrix to see affected records, conflicting values, field authority, downstream effects and any recorded resolution. Inconsistencies flagged on evidence appear here too.</Typography>
          </Paper>
        </SectionCard>
      )}
      <MatrixCard title="Coverage map" subtitle="Which sources support which portfolio information."><CoverageMap sources={sources.data} /></MatrixCard>
    </Stack>
  );
}
