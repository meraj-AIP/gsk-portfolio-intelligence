import AddIcon from '@mui/icons-material/Add';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useBriefingTray } from '@/app/context/BriefingTrayContext';
import { useAuth } from '@/features/auth/AuthContext';
import { GskLogo } from '@/shared/components/GskLogo';
import { can } from '@/shared/lib/permissions';
import { AppFooter } from './AppFooter';
import { ContextBar } from './ContextBar';
import { HeaderSearch } from './HeaderSearch';
import { HeaderTabs } from './HeaderTabs';
import { MyWorkBadge } from './MyWorkBadge';
import { ReadOnlyBanner } from './ReadOnlyBanner';
import { ScopeMenu } from './ScopeMenu';
import { UserMenu } from './UserMenu';

const Divider = () => <Box aria-hidden sx={(t) => ({ width: '1px', height: 24, bgcolor: t.palette.nav.text, opacity: 0.3, display: { xs: 'none', sm: 'block' } })} />;

/** Two-row navy header from the reference design, then the review context strip, then the page. */
export function AppShell({ children, panels }: { children: ReactNode; panels: ReactNode }) {
  const tray = useBriefingTray();
  const { user } = useAuth();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflowX: 'clip' }}>
      <AppBar position="sticky" elevation={0} sx={(t) => ({ bgcolor: t.palette.nav.background, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' })}>
        <Box sx={{ px: { xs: 2, md: 4 } }}>
          <Stack direction="row" sx={{ height: 64, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 2, minWidth: 0 }}>
              <Box component={RouterLink} to="/portfolio" aria-label="Portfolio overview"><GskLogo width={72} /></Box>
              <Divider />
              <Stack direction="row" sx={(t) => ({ display: { xs: 'none', sm: 'flex' }, gap: 0.75, fontSize: '0.75rem', fontWeight: 600, color: t.palette.nav.muted, whiteSpace: 'nowrap' })}>
                <span>Enterprise Data and AI</span><Box component="span" sx={{ opacity: 0.5 }}>/</Box>
                <Typography component="span" sx={(t) => ({ fontSize: 'inherit', fontWeight: 600, color: t.palette.common.white })}>Portfolio workspace</Typography>
              </Stack>
              <ScopeMenu />
            </Stack>
            <HeaderSearch />
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              {can(user, 'add to briefing') ? (
                <Badge badgeContent={tray.ids.length} color="primary" overlap="rectangular">
                  <Button component={RouterLink} to="/briefing" variant="contained" color="secondary" startIcon={<AddIcon />} sx={{ height: 36 }}>
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{can(user, 'prepare briefing') ? 'Prepare briefing' : 'Briefing'}</Box>
                  </Button>
                </Badge>
              ) : null}
              <MyWorkBadge />
              <Divider />
              <UserMenu />
            </Stack>
          </Stack>
          <HeaderTabs />
        </Box>
      </AppBar>
      <ContextBar />
      <ReadOnlyBanner />
      <Box component="main" sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3 }, pb: 6 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto' }}>{children}</Box>
      </Box>
      <AppFooter />
      {panels}
    </Box>
  );
}
