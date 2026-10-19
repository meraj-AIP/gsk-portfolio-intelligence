import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useReview } from '@/app/context/ReviewContext';
import { weekLabel } from '@/app/context/weekLabel';
import { usePortfolioAssessment } from '@/shared/api/hooks';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { OverviewRefs } from './OverviewRefs';

/** The written assessment: four rule-based lines, badged once as calculated so nobody reads it as AI. */
export function OverviewAssessment() {
  const { scope, viewSnapshot } = useReview();
  const q = usePortfolioAssessment(scope.portfolio, scope.viewSnapshotId);
  const week = weekLabel(viewSnapshot);
  return (
    <SectionCard title="Assessment" badge="Calculated" subtitle={week ? `From the ${week} snapshot` : 'From the current snapshot'}>
      {q.isError ? <ErrorState message="The assessment could not be calculated." onRetry={() => void q.refetch()} />
        : !q.data ? <LoadingState rows={4} />
        : !q.data.length ? <EmptyState title="Nothing to assess" hint="No review is available for this scope yet." />
        : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {q.data.map((line) => (
              <Box key={line.key} sx={(t) => ({ p: 1.5, borderRadius: 1, bgcolor: t.palette.brand.canvas, border: `1px solid ${t.palette.divider}` })}>
                <Typography variant="overline" component="h3">{line.heading}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>{line.text}</Typography>
                <OverviewRefs line={line} />
              </Box>
            ))}
          </Box>
        )}
    </SectionCard>
  );
}
