import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { StatementFrame } from '@/shared/components/ui/Statement';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import type { ExtrasState } from './useBriefingExtras';

/** Calculated figures sit in their own info-tinted block of stat cells so they never read as part of the typed narrative. */
export function FiguresBlock({ state }: { state: ExtrasState }) {
  const body = state.error ? <ErrorState message="Figures could not be calculated for this briefing." onRetry={state.retry} />
    : !state.cells ? <LoadingState rows={2} />
      : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 1 }}>
          {state.cells.map((c) => (
            <Box key={c.label} sx={(t) => ({ p: 1.25, borderRadius: 1, bgcolor: t.palette.background.paper, border: `1px solid ${t.palette.divider}` })}>
              <Typography variant="overline" component="p">{c.label}</Typography>
              <Typography variant="h2" component="p" sx={{ fontWeight: 700, fontFeatureSettings: '"tnum"', mt: 0.25 }}>{c.value}</Typography>
              <Typography variant="caption" component="p">{c.note}</Typography>
            </Box>
          ))}
        </Box>
      );
  return (
    <Box sx={{ mt: 1.5 }}>
      <StatementFrame type="calculated result" label="Calculated result, from records in this snapshot. These figures cannot be edited.">{body}</StatementFrame>
    </Box>
  );
}
