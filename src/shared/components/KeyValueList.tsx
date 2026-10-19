import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type Item = { label: string; value: ReactNode };

export function KeyValueList({ items, columns = 2 }: { items: Item[]; columns?: 1 | 2 | 3 }) {
  return (
    <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: `repeat(${columns}, minmax(0, 1fr))` }, gap: 1.25 }}>
      {items.map((item) => (
        <Box key={item.label}>
          <Typography component="dt" variant="caption" sx={{ display: 'block' }}>{item.label}</Typography>
          <Typography component="dd" variant="body2" sx={{ m: 0 }}>{item.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}
