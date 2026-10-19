import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import type { ExtrasState } from './useBriefingExtras';

/** Added to every briefing automatically. It has no remove control: open conclusions cannot be edited out of a briefing. */
export function UnresolvedSection({ state, position }: { state: ExtrasState; position: number }) {
  const [, openFinding] = useUrlParam('finding');
  const x = state.extras;
  const count = x ? x.unresolved.length + x.hiddenUnresolved : null;
  return (
    <Paper sx={(t) => ({ p: { xs: 2, md: 2.5 }, borderRadius: 2, bgcolor: t.palette.tint.warning.bg, borderColor: t.palette.tint.warning.fg, borderLeft: `4px solid ${t.palette.tint.warning.fg}` })}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h2">{position}. Unresolved conclusions</Typography>
        {count !== null ? <StatusChip tone={count ? 'warning' : 'success'}>{count ? `${count} open` : 'None open'}</StatusChip> : null}
      </Stack>
      <Typography variant="body2" sx={{ mt: 0.25, mb: 1.5, color: 'text.secondary' }}>Added automatically from open findings in scope. It stays in the briefing until each one is resolved.</Typography>
      {state.error ? <ErrorState message="Unresolved conclusions could not be loaded." onRetry={state.retry} />
        : !x ? <LoadingState rows={2} />
          : (
            <Stack sx={{ gap: 1 }}>
              {x.unresolved.length === 0 ? <Typography variant="body2">No unresolved conclusions in scope.</Typography> : null}
              {x.unresolved.map((u) => (
                <Box key={u.id} sx={(t) => ({ p: 1.25, borderRadius: 1, bgcolor: t.palette.background.paper })}>
                  <Link component="button" type="button" variant="body2" sx={{ textAlign: 'left', fontWeight: 600 }} onClick={() => openFinding(u.id)}>{u.title}</Link>
                  <Typography variant="caption" component="p">{u.id}. {u.reason}</Typography>
                </Box>
              ))}
              {x.hiddenUnresolved ? <Typography variant="caption">{x.hiddenUnresolved} more hidden for this audience (cost detail is restricted to leadership).</Typography> : null}
            </Stack>
          )}
    </Paper>
  );
}
