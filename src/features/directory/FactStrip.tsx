import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type FactTile = { label: string; value: ReactNode };

/** Small reference fact tiles: uppercase micro-label over one recorded value, on the quiet canvas tint. */
export function FactStrip({ items, min = 180 }: { items: FactTile[]; min?: number }) {
  return (
    <Box component="dl" sx={{ m: 0, display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: `repeat(auto-fill, minmax(${min}px, 1fr))` } }}>
      {items.map((f) => (
        <Box key={f.label} sx={(t) => ({ px: 1.5, py: 1, borderRadius: 1, bgcolor: t.palette.brand.canvas, border: `1px solid ${t.palette.divider}`, minWidth: 0 })}>
          <Typography component="dt" variant="overline" sx={{ fontSize: '0.625rem', display: 'block' }}>{f.label}</Typography>
          <Typography component="dd" variant="body2" sx={{ m: 0, mt: 0.25, fontWeight: 600, color: 'primary.main' }}>{f.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}
