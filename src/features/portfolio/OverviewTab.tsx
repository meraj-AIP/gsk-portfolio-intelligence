import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { SectionCard } from '@/shared/components/SectionCard';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { FindingsList } from '@/features/findings/FindingsList';
import { ChangeHistory } from './ChangeHistory';
import { OverviewAssessment } from './OverviewAssessment';
import { OverviewAttention } from './OverviewAttention';
import { OverviewKpis } from './OverviewKpis';
import { OverviewMatrixTable } from './OverviewMatrixTable';
import { useOverviewParams } from './OverviewParams';
import { OverviewSinceReview } from './OverviewSinceReview';
import { OverviewStageFlow } from './OverviewStageFlow';
import type { PortfolioView } from './usePortfolioView';

/**
 * Overview tab in the reference order. Board shows everything; matrix keeps the figures, assessment and table;
 * stage-gate keeps the figures, an expanded lifecycle flow and the table.
 */
export function OverviewTab({ view }: { view: PortfolioView }) {
  const [, openFinding] = useUrlParam('finding');
  const { view: mode, stage } = useOverviewParams();
  const board = mode === 'board';
  return (
    <Stack sx={{ gap: 3 }}>
      <OverviewKpis view={view} />
      {mode !== 'stage' ? <OverviewAssessment /> : null}
      {mode !== 'matrix' ? <OverviewStageFlow projects={view.projects} expanded={mode === 'stage'} /> : null}
      {board ? <OverviewAttention view={view} stage={stage} /> : null}
      <OverviewMatrixTable view={view} />
      {board ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 6 }}><OverviewSinceReview view={view} /></Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title="Open findings" subtitle={`${view.findings.length} in this review. Select one to follow it from evidence to resolution.`}>
              <FindingsList findings={view.findings} onOpen={(id) => openFinding(id)} />
            </SectionCard>
          </Grid>
        </Grid>
      ) : null}
      {board ? <ChangeHistory view={view} /> : null}
    </Stack>
  );
}
