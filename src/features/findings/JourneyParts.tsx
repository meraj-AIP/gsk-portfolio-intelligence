import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { StatusChip, type Tone } from '@/shared/components/ui/StatusChip';
import { LIFECYCLE, type Lifecycle } from '@/shared/lib/journey';
import type { StatementType } from '@/shared/types/domain';

/** One numbered step of the journey as a reference card. The number keeps the reading order obvious when a step is short. */
export function Step({ n, title, lead, children }: { n: number; title: string; lead?: string; children: ReactNode }) {
  return (
    <Paper component="section" aria-label={title} sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', mb: lead ? 1 : 1.5 }}>
        <Box aria-hidden sx={(t) => ({ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: t.palette.brand.navy, color: t.palette.common.white, fontSize: '0.8125rem', fontWeight: 700 })}>{n}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" component="p">Step {n} of 6</Typography>
          <Typography variant="h3" component="h3">{title}</Typography>
        </Box>
      </Stack>
      {lead ? <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>{lead}</Typography> : null}
      <Stack sx={{ gap: 1.5, minWidth: 0 }}>{children}</Stack>
    </Paper>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="overline" component="p" sx={{ mb: 0.25 }}>{label}</Typography>
      <Typography variant="body2" component="div">{children}</Typography>
    </Box>
  );
}

export const STATEMENT_LABEL: Record<StatementType, string> = {
  'reported fact': 'Reported fact',
  'calculated result': 'Calculated result',
  'AI interpretation': 'AI interpretation, not a reported fact',
};

/** One tone per basis across the product: reported fact neutral, calculated result info, AI interpretation accent. */
export const STATEMENT_TONE: Record<StatementType, Tone> = { 'reported fact': 'neutral', 'calculated result': 'info', 'AI interpretation': 'accent' };

export function StatementChip({ type, label }: { type: StatementType; label?: string }) {
  return <StatusChip tone={STATEMENT_TONE[type]} square>{label ?? STATEMENT_LABEL[type]}</StatusChip>;
}

/** Frames a statement with its basis written above it, so a calculation or interpretation never reads as a reported value. */
export function StatementFrame({ type, label, children }: { type: StatementType; label?: string; children: ReactNode }) {
  const tone = STATEMENT_TONE[type];
  return (
    <Box sx={(t) => ({ borderRadius: 1, p: 1.5, bgcolor: alpha(t.palette.tint[tone].bg, 0.6), border: `1px solid ${alpha(t.palette.tint[tone].fg, 0.25)}`, borderLeft: `3px solid ${t.palette.tint[tone].fg}` })}>
      <Typography variant="overline" component="p" sx={(t) => ({ mb: 0.75, color: t.palette.tint[tone].fg })}>{label ?? STATEMENT_LABEL[type]}</Typography>
      {children}
    </Box>
  );
}

/** Segmented stage track in the reference style: passed stages navy, the current one orange, the rest neutral. Text carries the meaning. */
export function LifecycleProgress({ stage, detail }: { stage: Lifecycle; detail: string }) {
  const at = LIFECYCLE.indexOf(stage);
  const done = stage === 'resolved';
  return (
    <Box>
      <Box aria-hidden sx={{ display: 'grid', gridTemplateColumns: `repeat(${LIFECYCLE.length}, 1fr)`, gap: 0.5 }}>
        {LIFECYCLE.map((s, i) => {
          const current = i === at && !done;
          return (
            <Box key={s} sx={{ minWidth: 0 }}>
              <Box sx={(t) => ({ height: 6, borderRadius: 0.5, bgcolor: current ? t.palette.brand.accent : i <= at ? t.palette.brand.navy : t.palette.divider })} />
              <Typography noWrap sx={(t) => ({ mt: 0.5, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: current ? t.palette.brand.accent : i <= at ? t.palette.brand.navy : t.palette.text.disabled })}>
                {i + 1}. {s}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Typography variant="body2" sx={{ mt: 1 }}>
        <strong>Stage {at + 1} of {LIFECYCLE.length}: {stage}.</strong> {detail}
      </Typography>
    </Box>
  );
}

export const muted = { color: 'text.secondary' } as const;
