import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type ChipOption = { value: string; label: string; count?: number };

/** Pill filter row: the selected pill is navy, the rest are quiet. Used for domain and programme filters. */
export function FilterChips({ label, options, value, onChange }: { label?: string; options: ChipOption[]; value: string; onChange: (v: string) => void }) {
  return (
    <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }} role="group" aria-label={label ?? 'Filter'}>
      {label ? <Typography variant="overline" sx={{ mr: 0.5 }}>{label}</Typography> : null}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <ButtonBase
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={on}
            sx={(t) => ({
              px: 1.25, py: 0.5, borderRadius: 9999, fontSize: '0.75rem', fontWeight: on ? 600 : 500,
              bgcolor: on ? t.palette.brand.navy : t.palette.tint.neutral.bg, color: on ? t.palette.common.white : t.palette.tint.neutral.fg,
              '&:hover': { bgcolor: on ? t.palette.brand.navyDark : t.palette.divider },
            })}
          >
            {o.label}{o.count !== undefined ? ` (${o.count})` : ''}
          </ButtonBase>
        );
      })}
    </Stack>
  );
}

type ToggleOption = { value: string; label: string; icon?: ReactNode };

/** Segmented view toggle: white raised pill on a quiet track, accent icon on the selected option. */
export function SegmentedToggle({ options, value, onChange, label }: { options: ToggleOption[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <Box role="tablist" aria-label={label} sx={(t) => ({ display: 'inline-flex', p: 0.5, borderRadius: 2, bgcolor: t.palette.tint.neutral.bg, gap: 0.25, flexWrap: 'wrap' })}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <ButtonBase
            key={o.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            sx={(t) => ({
              display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.75, borderRadius: 1, fontSize: '0.75rem',
              fontWeight: on ? 600 : 500, color: on ? t.palette.brand.navy : t.palette.text.secondary,
              bgcolor: on ? t.palette.background.paper : 'transparent', boxShadow: on ? 1 : 'none',
              '& svg': { fontSize: 16, color: on ? t.palette.brand.accent : 'inherit' },
            })}
          >
            {o.icon}{o.label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

/** Thin progress rule with a caption above it, as in the reference matrix "stage gate progress" column. */
export function ProgressLine({ caption, value, tone = 'navy' }: { caption: string; value: number; tone?: 'navy' | 'accent' | 'success' }) {
  return (
    <Box sx={{ minWidth: 120 }}>
      <Typography sx={(t) => ({ fontSize: '0.6875rem', fontWeight: 600, color: tone === 'accent' ? t.palette.brand.accent : tone === 'success' ? t.palette.tint.success.fg : t.palette.brand.navy })}>{caption}</Typography>
      <Box sx={(t) => ({ mt: 0.5, height: 4, borderRadius: 9999, bgcolor: t.palette.divider, overflow: 'hidden' })}>
        <Box sx={(t) => ({ height: '100%', width: `${Math.max(0, Math.min(100, value))}%`, borderRadius: 9999, bgcolor: tone === 'accent' ? t.palette.brand.accent : tone === 'success' ? t.palette.success.main : t.palette.brand.navy })} />
      </Box>
    </Box>
  );
}
