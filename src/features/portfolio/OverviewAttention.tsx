import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useAllProjects, useCommitments, useCostRecords } from '@/shared/api/hooks';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { InitiativeCard } from '@/shared/components/ui/InitiativeCard';
import { formatDate, gbpShort } from '@/shared/lib/format';
import { costSummary } from '@/shared/lib/portfolio';
import { bySeverity, nextMilestone, worstOf } from './OverviewModel';
import { OverviewFoundationCard } from './OverviewFoundationCard';
import type { PortfolioView } from './usePortfolioView';

const SHOWN = 5;

/**
 * The five most severe projects in scope, then the foundations programme every other programme leans on.
 * A plain section rather than a SectionCard, because the reference lays these cards straight on the canvas.
 */
export function OverviewAttention({ view, stage }: { view: PortfolioView; stage: string }) {
  const commitments = useCommitments();
  const costs = useCostRecords();
  const total = useAllProjects().data?.length;
  const pool = stage ? view.projects.filter((p) => p.stage === stage) : view.projects;
  const top = bySeverity(pool).slice(0, SHOWN);
  const programmeName = (id: string) => view.programmes.find((p) => p.id === id)?.name ?? id;

  const body = () => {
    if (commitments.isError || costs.isError) return <ErrorState message="Commitments or costs could not be loaded." onRetry={() => { void commitments.refetch(); void costs.refetch(); }} />;
    if (!commitments.data || !costs.data) return <LoadingState rows={3} />;
    if (!top.length) return <EmptyState title={stage ? `No projects at ${stage.toLowerCase()} in this scope` : 'No projects in this scope'} hint="Clear the stage filter or choose another programme." />;
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {top.map((p) => {
          const cost = costSummary(costs.data, [p.id]);
          const next = nextMilestone(p.id, commitments.data);
          return (
            <InitiativeCard
              key={p.id}
              tag={programmeName(p.programmeId)}
              status={<ConditionChip condition={worstOf(p)} />}
              title={p.name}
              description={p.purpose}
              facts={[
                { label: 'Stage', value: p.stage },
                { label: 'Forecast against budget', value: cost.budget ? `${gbpShort(cost.forecast)} of ${gbpShort(cost.budget)}` : 'No direct budget' },
              ]}
              highlight={next ? { label: 'Next milestone', text: `${next.title} (${formatDate(next.currentDate)})` } : undefined}
              owner={{ name: p.owner, role: 'Project owner' }}
              to={`/projects/${p.id}`}
            />
          );
        })}
        <OverviewFoundationCard />
      </Box>
    );
  };

  return (
    <Box component="section" aria-labelledby="attention-title">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography id="attention-title" variant="h2">Projects needing attention</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            Ranked by worst condition this review, then by how many dimensions carry an exception{stage ? `. Showing the ${stage.toLowerCase()} stage only` : ''}.
          </Typography>
        </Box>
        <Link component={RouterLink} to="/directory" variant="label" color="secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          View all{total !== undefined ? ` ${total}` : ''} projects<ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Link>
      </Box>
      {body()}
    </Box>
  );
}
