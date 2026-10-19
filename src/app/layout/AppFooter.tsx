import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

/** Footer strip from the reference design, pointing at the supporting views that explain where numbers come from. */
export function AppFooter() {
  return (
    <Box component="footer" sx={(t) => ({ borderTop: `1px solid ${t.palette.divider}`, bgcolor: t.palette.background.paper, px: { xs: 2, md: 4 }, py: 2 })}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ maxWidth: 1280, mx: 'auto', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="label" sx={{ color: 'text.secondary' }}>GSK Enterprise Data and AI. Portfolio workspace for internal use only.</Typography>
        <Stack direction="row" sx={{ gap: 3 }}>
          <Link component={RouterLink} to="/sources" variant="caption" sx={{ fontWeight: 600 }}>Sources and quality</Link>
          <Link component={RouterLink} to="/definitions" variant="caption" sx={{ fontWeight: 600 }}>Definitions</Link>
          <Link component={RouterLink} to="/sources?tab=audit" variant="caption" sx={{ fontWeight: 600 }}>Audit trail</Link>
        </Stack>
      </Stack>
    </Box>
  );
}
