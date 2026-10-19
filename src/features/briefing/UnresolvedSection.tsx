import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import type { ExtrasState } from './useBriefingExtras';

/** Added to every briefing automatically. It has no remove control: open conclusions cannot be edited out of a briefing. */
export function UnresolvedSection({ state, position }: { state: ExtrasState; position: number }) {
  const [, openFinding] = useUrlParam('finding');
  const x = state.extras;
  return (
    <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 0.5 }}>
      <Typography variant="h3">{position}. Unresolved conclusions</Typography>
      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>Added automatically from open findings in scope. It stays in the briefing until each one is resolved.</Typography>
      {state.error ? <ErrorState message="Unresolved conclusions could not be loaded." onRetry={state.retry} />
        : !x ? <LoadingState rows={2} />
          : (
            <Stack sx={{ gap: 0.75 }}>
              {x.unresolved.length === 0 ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>No unresolved conclusions in scope.</Typography> : null}
              {x.unresolved.map((u) => (
                <Box key={u.id}>
                  <Link component="button" type="button" variant="body2" sx={{ textAlign: 'left' }} onClick={() => openFinding(u.id)}>{u.title}</Link>
                  <Typography variant="caption" sx={{ display: 'block' }}>{u.reason}</Typography>
                </Box>
              ))}
              {x.hiddenUnresolved ? <Typography variant="caption">{x.hiddenUnresolved} more hidden for this audience (cost detail is restricted to leadership).</Typography> : null}
            </Stack>
          )}
    </Box>
  );
}
