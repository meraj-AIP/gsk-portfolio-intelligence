import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import type { StatementType } from '@/shared/types/domain';
import { StatusChip, type Tone } from './StatusChip';

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
