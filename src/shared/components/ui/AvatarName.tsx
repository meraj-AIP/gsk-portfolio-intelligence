import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const initialsOf = (name: string) => name.replace(/^(Dr|Mr|Ms|Mrs)\.? /, '').split(/[\s,]+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');

/** Initials disc with a name and an optional role line, as used for owners and sponsors. */
export function AvatarName({ name, subtitle, size = 28 }: { name: string; subtitle?: string; size?: number }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box aria-hidden sx={(t) => ({
        width: size, height: size, borderRadius: '50%', bgcolor: t.palette.brand.navy, color: t.palette.common.white, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700,
      })}>
        {initialsOf(name)}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', lineHeight: 1.2 }} noWrap>{name}</Typography>
        {subtitle ? <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', lineHeight: 1.3 }} noWrap>{subtitle}</Typography> : null}
      </Box>
    </Stack>
  );
}
