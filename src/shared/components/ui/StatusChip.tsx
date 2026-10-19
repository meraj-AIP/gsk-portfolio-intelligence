import Box from '@mui/material/Box';
import type { ReactNode } from 'react';

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';

type Props = { tone: Tone; children: ReactNode; dot?: boolean; square?: boolean; title?: string };

/** Tinted status pill from the reference design: soft background, strong text, optional live dot. */
export function StatusChip({ tone, children, dot = true, square = false, title }: Props) {
  return (
    <Box
      component="span"
      title={title}
      sx={(t) => ({
        display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.25, minHeight: 22,
        borderRadius: square ? 0.5 : 9999, bgcolor: t.palette.tint[tone].bg, color: t.palette.tint[tone].fg,
        fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.33, letterSpacing: '0.02em', whiteSpace: 'nowrap',
      })}
    >
      {dot ? <Box component="span" aria-hidden sx={(t) => ({ width: 6, height: 6, borderRadius: '50%', bgcolor: t.palette.tint[tone].fg, flexShrink: 0 })} /> : null}
      {children}
    </Box>
  );
}

/** Rectangular domain tag, as on the reference initiative cards. Dark variant marks the lead tag. */
export function DomainTag({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return (
    <Box
      component="span"
      sx={(t) => ({
        display: 'inline-flex', alignItems: 'center', px: 1, py: 0.25, borderRadius: 0.5, fontSize: '0.6875rem', fontWeight: 600,
        letterSpacing: '0.02em', whiteSpace: 'nowrap',
        ...(strong ? { bgcolor: t.palette.brand.navy, color: t.palette.common.white } : { bgcolor: t.palette.tint.neutral.bg, color: t.palette.tint.neutral.fg, border: `1px solid ${t.palette.divider}` }),
      })}
    >
      {children}
    </Box>
  );
}
