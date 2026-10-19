import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { useSearchParams } from 'react-router-dom';
import { useReview } from '@/app/context/ReviewContext';
import { useSnapshots } from '@/shared/api/hooks';
import { AskForm } from './AskForm';
import { RunHistory } from './RunHistory';
import { useAskContext } from './useAskContext';
import { useInvestigation } from './useInvestigation';

const shortWeek = (week: string | undefined) => (week ? week.replace(/^\d{4}-/, '') : 'the open review');

/**
 * Contextual Ask, opened on any page with ?ask=<contextId>&q=<question>. Lives in the shell so runs in flight
 * keep going while the panel is closed, and it stacks above the finding panel it was opened from.
 */
export function AskPanel() {
  const [params, setParams] = useSearchParams();
  const about = params.get('ask') ?? '';
  const q = params.get('q') ?? '';
  const open = params.has('ask');
  const { scope } = useReview();
  const snapshots = useSnapshots();
  const context = useAskContext(open ? about : '');
  const { runs, start, cancel } = useInvestigation();

  const patch = (next: Record<string, string | null>) => setParams((prev) => {
    const copy = new URLSearchParams(prev);
    Object.entries(next).forEach(([k, v]) => (v === null ? copy.delete(k) : copy.set(k, v)));
    return copy;
  }, { replace: true });

  const period = `${shortWeek(snapshots.data?.find((s) => s.status === 'open')?.week)} compared with ${scope.comparisonSnapshotId.replace('SNAP-', '') || 'the previous review'}`;
  const run = (question: string) => void start({ question, contextIds: context.contextIds, period });

  return (
    <Drawer anchor="right" open={open} onClose={() => patch({ ask: null, q: null })}
      sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      slotProps={{ paper: { sx: { width: { xs: '100%', md: 560 }, bgcolor: 'background.default' } } }}>
      <Stack direction="row" sx={(t) => ({ alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, bgcolor: t.palette.brand.navy, color: t.palette.common.white })}>
        <Box>
          <Typography variant="overline" component="p" sx={(t) => ({ color: t.palette.nav.muted })}>Ask the portfolio</Typography>
          <Typography variant="subtitle1" sx={(t) => ({ color: t.palette.common.white })}>{context.label || 'Investigation'}</Typography>
        </Box>
        <IconButton aria-label="Close ask" onClick={() => patch({ ask: null, q: null })} sx={{ color: 'inherit' }}><CloseIcon /></IconButton>
      </Stack>
      <Box sx={{ p: 2.5, overflowY: 'auto' }}>
        <Stack sx={{ gap: 2 }}>
          <Box sx={(t) => ({ p: 1.25, borderRadius: 1, bgcolor: t.palette.tint.accent.bg, color: t.palette.tint.accent.fg })}>
            <Typography variant="body2" sx={{ color: 'inherit' }}>Answers are AI interpretation, not reported fact. Each comes back with its method, inputs, evidence and what remains uncertain.</Typography>
          </Box>
          <AskForm key={`${about}|${q}`} initialQuestion={q} context={context} period={period} role={scope.role} onRun={run} />
          <RunHistory live={runs} onCancel={cancel} onRefine={(text) => patch({ q: text })} contextIds={context.contextIds} />
        </Stack>
      </Box>
    </Drawer>
  );
}
