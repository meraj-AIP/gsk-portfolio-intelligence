import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type Props = { title: string; subtitle?: ReactNode; actions?: ReactNode; meta?: ReactNode; eyebrow?: ReactNode };

/**
 * The command strip from the reference design: a full-width white band under the header with an eyebrow line,
 * the page title, a one-sentence description and the page's actions on the right. The page column is centred
 * at 1280px, so the band escapes it to span the viewport.
 */
export function PageHeader({ title, subtitle, actions, meta, eyebrow }: Props) {
  return (
    <Box sx={(t) => ({ mx: 'calc(50% - 50vw)', mt: { xs: -2, md: -3 }, mb: 3, px: { xs: 2, md: 4 }, py: 2.5, bgcolor: t.palette.background.paper, borderBottom: `1px solid ${t.palette.divider}`, boxShadow: '0 1px 2px rgba(19, 41, 67, 0.04)' })}>
      <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { lg: 'center' }, gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            {eyebrow ? <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>{eyebrow}</Stack> : null}
            <Typography variant="h1">{title}</Typography>
            {subtitle ? <Typography variant="body1" component="div" sx={{ color: 'text.secondary', mt: 0.25, maxWidth: 820 }}>{subtitle}</Typography> : null}
          </Box>
          {actions ? <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>{actions}</Stack> : null}
        </Stack>
        {meta ? <Box sx={{ mt: 2 }}>{meta}</Box> : null}
      </Box>
    </Box>
  );
}
