import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useReview } from '@/app/context/ReviewContext';
import { useSources } from '@/shared/api/hooks';
import { ADMIN_ITEMS, NAV_ITEMS, isActive, type NavItem } from './navItems';

function Tab({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <ButtonBase
      component={RouterLink}
      to={item.to}
      aria-current={active ? 'page' : undefined}
      sx={(t) => ({
        height: '100%', px: 0.5, whiteSpace: 'nowrap', fontSize: active ? '0.8125rem' : '0.75rem', fontWeight: active ? 600 : 600, letterSpacing: '0.02em',
        color: active ? t.palette.common.white : t.palette.nav.text, borderBottom: `2px solid ${active ? t.palette.brand.accentHover : 'transparent'}`,
        '&:hover': { color: t.palette.common.white },
      })}
    >
      {item.label}
    </ButtonBase>
  );
}

/** Second header row: section tabs with the accent underline, the admin menu, and a live status line on the right. */
export function HeaderTabs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { viewSnapshot } = useReview();
  const sources = useSources();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const adminActive = ADMIN_ITEMS.some((i) => isActive(i, pathname));
  const unhealthy = (sources.data ?? []).filter((s) => s.connectionHealth !== 'healthy').length;
  return (
    <Stack direction="row" sx={{ height: 48, alignItems: 'stretch', justifyContent: 'space-between', gap: 2 }}>
      <Stack component="nav" aria-label="Main" direction="row" sx={{ gap: 3, alignItems: 'stretch', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
        {NAV_ITEMS.map((i) => <Tab key={i.to} item={i} active={isActive(i, pathname)} />)}
        <ButtonBase onClick={(e) => setAnchor(e.currentTarget)} aria-haspopup="menu"
          sx={(t) => ({ gap: 0.25, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', color: adminActive ? t.palette.common.white : t.palette.nav.text, borderBottom: `2px solid ${adminActive ? t.palette.brand.accentHover : 'transparent'}`, '&:hover': { color: t.palette.common.white } })}>
          Administration <ExpandMoreIcon sx={{ fontSize: 16 }} />
        </ButtonBase>
        <Menu open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)}>
          {ADMIN_ITEMS.map((i) => <MenuItem key={i.to} selected={isActive(i, pathname)} onClick={() => { setAnchor(null); navigate(i.to); }}>{i.label}</MenuItem>)}
        </Menu>
      </Stack>
      <Stack direction="row" sx={(t) => ({ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1, color: t.palette.nav.text, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' })}>
        <Box component={RouterLink} to="/sources" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'inherit', textDecoration: 'none' }}>
          <Box aria-hidden sx={(t) => ({ width: 8, height: 8, borderRadius: '50%', bgcolor: unhealthy ? t.palette.warning.main : t.palette.success.main })} />
          {sources.data ? (unhealthy ? `${unhealthy} ${unhealthy === 1 ? 'source needs' : 'sources need'} attention` : 'Sources healthy') : 'Checking sources'}
        </Box>
        {viewSnapshot ? <><span aria-hidden>•</span><span>{viewSnapshot.label}</span></> : null}
      </Stack>
    </Stack>
  );
}
