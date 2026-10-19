import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import type { ExtrasState } from './useBriefingExtras';

/** Calculated figures sit in their own bordered block so they never read as part of the typed narrative. */
export function FiguresBlock({ state }: { state: ExtrasState }) {
  const body = state.error ? <ErrorState message="Figures could not be calculated for this briefing." onRetry={state.retry} />
    : !state.extras ? <LoadingState rows={2} />
      : state.extras.figureLines.map((l) => <Typography key={l} variant="body2">{l}</Typography>);
  return (
    <Box sx={{ mt: 1, p: 1.25, border: 1, borderColor: 'divider', borderRadius: 0.5, bgcolor: 'background.default' }}>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Calculated from records in this snapshot. These figures cannot be edited.</Typography>
      {body}
    </Box>
  );
}
