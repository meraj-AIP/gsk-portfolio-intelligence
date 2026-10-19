import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type Props = { title: string; children: ReactNode; actions?: ReactNode; dense?: boolean; sx?: object; subtitle?: ReactNode; badge?: string };

/** Card section from the reference design: headline, optional quiet badge and one-line description, actions on the right. */
export function SectionCard({ title, children, actions, dense = false, sx, subtitle, badge }: Props) {
  return (
    <Paper sx={{ p: dense ? 2 : { xs: 2, md: 2.5 }, borderRadius: 2, ...sx }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' }, mb: 2, gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Typography variant={dense ? 'h3' : 'h2'}>{title}</Typography>
            {badge ? <Box component="span" sx={(t) => ({ fontSize: '0.75rem', px: 1, py: 0.25, borderRadius: 0.5, bgcolor: t.palette.tint.neutral.bg, color: t.palette.text.secondary })}>{badge}</Box> : null}
          </Stack>
          {subtitle ? <Typography variant="body2" component="div" sx={{ color: 'text.secondary', mt: 0.25 }}>{subtitle}</Typography> : null}
        </Box>
        {actions ? <Box sx={{ flexShrink: 0 }}>{actions}</Box> : null}
      </Stack>
      {children}
    </Paper>
  );
}
