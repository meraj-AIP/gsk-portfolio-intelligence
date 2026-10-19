import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { useSearchParams } from 'react-router-dom';
import { useBriefingTray } from '@/app/context/BriefingTrayContext';
import { useAuth } from '@/features/auth/AuthContext';
import { useFindingJourney } from '@/shared/api/hooks';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { can } from '@/shared/lib/permissions';
import { CATEGORY_CONDITION, isConfirmed } from '@/shared/lib/portfolio';
import type { Finding } from '@/shared/types/domain';
import { LifecycleProgress, StatementChip } from './JourneyParts';
import { StepChange } from './StepChange';
import { StepEvidence } from './StepEvidence';
import { StepImpact } from './StepImpact';
import { StepImplication } from './StepImplication';
import { StepResolution } from './StepResolution';
import { StepResponse } from './StepResponse';

const ASK_PROMPT = 'What supports the reported progress?';

function Header({ f, lifecycle }: { f: Finding; lifecycle: Parameters<typeof LifecycleProgress>[0] }) {
  const { user } = useAuth();
  const tray = useBriefingTray();
  const [, setParams] = useSearchParams();
  // Both params change together; two single-key setters would each start from the same stale URL and drop one.
  const ask = () => setParams((prev) => {
    const next = new URLSearchParams(prev);
    next.set('ask', f.id);
    next.set('q', ASK_PROMPT);
    return next;
  }, { replace: true });
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Stack sx={{ gap: 1.5 }}>
        <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
          <ConditionChip condition={CATEGORY_CONDITION[f.category]} label={f.category} />
          <StatementChip type={f.statementType} />
          <StatusChip tone="neutral" dot={false}>Version {f.version}</StatusChip>
          {f.persistent ? <StatusChip tone="warning" dot={false}>Persistent since {f.firstSeenWeek.replace(/^\d{4}-/, '')}</StatusChip> : null}
          {isConfirmed(f) ? <StatusChip tone="success">Owner confirmed</StatusChip> : null}
        </Stack>
        <Typography variant="h2">{f.title}</Typography>
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          {can(user, 'add to briefing') ? <Button variant="outlined" onClick={() => tray.add(f.id)} disabled={tray.has(f.id)}>{tray.has(f.id) ? 'In briefing' : 'Add to briefing'}</Button> : null}
          <Button variant="outlined" onClick={ask}>Ask about this</Button>
        </Stack>
        <Box>
          <Typography variant="overline" component="p" sx={{ mb: 0.75 }}>Lifecycle</Typography>
          <LifecycleProgress {...lifecycle} />
        </Box>
      </Stack>
    </Paper>
  );
}

function Journey({ id }: { id: string }) {
  const query = useFindingJourney(id);
  if (query.isLoading) return <LoadingState rows={6} />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />;
  const j = query.data;
  if (!j) return <EmptyState title="Finding not found" hint="It may have been withdrawn, or the link may be out of date." />;
  return (
    <Stack sx={{ gap: 2 }}>
      <Header f={j.finding} lifecycle={j.lifecycle} />
      <StepChange f={j.finding} trail={j.trail} />
      <StepImpact impact={j.impact} evidence={j.evidence} />
      <StepImplication f={j.finding} implication={j.implication} />
      <StepEvidence f={j.finding} evidence={j.evidence} />
      <StepResponse f={j.finding} evidence={j.evidence} />
      <StepResolution f={j.finding} lifecycle={j.lifecycle} decisions={j.decisions} actions={j.actions} />
    </Stack>
  );
}

/** S09. One finding as a connected journey: what changed through to how it was resolved. Opened from any screen via ?finding=. */
export function FindingPanel() {
  const [id, setId] = useUrlParam('finding');
  return (
    <Drawer anchor="right" open={Boolean(id)} onClose={() => setId(null)} slotProps={{ paper: { sx: { width: { xs: '100%', md: 640 }, bgcolor: 'background.default' } } }}>
      <Stack direction="row" sx={(t) => ({ alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5, bgcolor: t.palette.brand.navy, color: t.palette.common.white })}>
        <Box>
          <Typography variant="overline" component="p" sx={(t) => ({ color: t.palette.nav.muted })}>Finding journey</Typography>
          <Typography variant="subtitle1" sx={(t) => ({ color: t.palette.common.white })}>{id}</Typography>
        </Box>
        <IconButton aria-label="Close finding" onClick={() => setId(null)} sx={{ color: 'inherit' }}><CloseIcon /></IconButton>
      </Stack>
      <Box sx={{ p: 2.5, overflowY: 'auto' }}>{id ? <Journey key={id} id={id} /> : null}</Box>
    </Drawer>
  );
}
