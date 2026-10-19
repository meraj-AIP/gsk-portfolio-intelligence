import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import type { Tone } from './StatusChip';

type Props = {
  label: string;
  value: string;
  unit?: string;
  delta?: { text: string; tone: Tone };
  icon: ReactNode;
  iconTone?: 'navy' | Tone;
  footer: ReactNode;
  /** 0 to 100. Omit when the figure has no meaningful proportion. */
  progress?: number;
  progressTone?: 'navy' | 'accent' | Tone;
  to?: string;
};

/** KPI stat tile: micro label, display figure, icon well, one-line footer and an optional thin progress rule. */
export function KpiTile({ label, value, unit, delta, icon, iconTone = 'navy', footer, progress, progressTone = 'navy', to }: Props) {
  const body = (
    <Paper sx={{ p: 2, height: '100%', width: '100%', textAlign: 'left', borderRadius: 2, transition: 'box-shadow 150ms', '&:hover': to ? { boxShadow: 3 } : undefined }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" component="p">{label}</Typography>
          <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="metric">{value}</Typography>
            {unit ? <Typography variant="label" sx={{ color: 'text.secondary' }}>{unit}</Typography> : null}
            {delta ? <Typography variant="label" sx={(t) => ({ color: t.palette.tint[delta.tone].fg })}>{delta.text}</Typography> : null}
          </Stack>
        </Box>
        <Box
          aria-hidden
          sx={(t) => ({
            width: 40, height: 40, borderRadius: 2, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            ...(iconTone === 'navy' ? { bgcolor: t.palette.brand.navy, color: t.palette.common.white } : { bgcolor: t.palette.tint[iconTone].bg, color: t.palette.tint[iconTone].fg }),
          })}
        >
          {icon}
        </Box>
      </Stack>
      <Box sx={{ mt: 2, fontSize: '0.75rem', color: 'text.secondary' }}>{footer}</Box>
      {progress !== undefined ? (
        <Box sx={(t) => ({ mt: 1, height: 4, borderRadius: 9999, bgcolor: t.palette.tint.neutral.bg, overflow: 'hidden' })} role="presentation">
          <Box sx={(t) => ({
            height: '100%', width: `${Math.max(0, Math.min(100, progress))}%`, borderRadius: 9999,
            bgcolor: progressTone === 'navy' ? t.palette.brand.navy : progressTone === 'accent' ? t.palette.brand.accent : t.palette.tint[progressTone].fg,
          })} />
        </Box>
      ) : null}
    </Paper>
  );
  if (!to) return body;
  return <ButtonBase component={RouterLink} to={to} sx={{ display: 'flex', height: '100%', borderRadius: 2 }} aria-label={`${label}: ${value}`}>{body}</ButtonBase>;
}
