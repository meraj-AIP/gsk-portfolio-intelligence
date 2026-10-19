import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type Props = { title: string; subtitle?: ReactNode; actions?: ReactNode; footer?: ReactNode; children: ReactNode };

/**
 * The reference "portfolio matrix" frame: heading strip, a table that runs flush to the card edges and a quiet
 * footer for the pager. Decisions, sources and the audit trail share it so every list reads the same way.
 */
export function MatrixCard({ title, subtitle, actions, footer, children }: Props) {
  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ px: 2.5, py: 2, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h2">{title}</Typography>
          {subtitle ? <Typography variant="body2" component="div" sx={{ color: 'text.secondary', mt: 0.25 }}>{subtitle}</Typography> : null}
        </Box>
        {actions ? <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>{actions}</Stack> : null}
      </Stack>
      <Box sx={{ overflowX: 'auto' }}>{children}</Box>
      {footer ? <Box sx={(t) => ({ px: 2.5, py: 1.25, borderTop: `1px solid ${t.palette.divider}`, bgcolor: t.palette.brand.canvas })}>{footer}</Box> : null}
    </Paper>
  );
}

/** Loading, empty and error panels need the card's inner gutter, which the flush table does not have. */
export function MatrixMessage({ children }: { children: ReactNode }) {
  return <Box sx={{ px: 2.5, pb: 2.5 }}>{children}</Box>;
}

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/** First-column cell: record name in navy semibold over its identifier line, as in the reference matrix. */
export function RowTitle({ title, meta }: { title: ReactNode; meta?: ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" component="div" sx={{ fontWeight: 600, color: 'primary.main' }}>{title}</Typography>
      {meta ? <Typography component="div" sx={{ fontSize: '0.6875rem', color: 'text.secondary', fontFamily: MONO, mt: 0.25 }}>{meta}</Typography> : null}
    </Box>
  );
}
