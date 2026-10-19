import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HubIcon from '@mui/icons-material/Hub';
import ButtonBase from '@mui/material/ButtonBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { useReview } from '@/app/context/ReviewContext';
import { useProgrammes } from '@/shared/api/hooks';

/** Portfolio scope selector in the header: every screen filters to this programme or to all of them. */
export function ScopeMenu() {
  const { scope, setScope } = useReview();
  const programmes = useProgrammes();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = programmes.data?.find((p) => p.id === scope.portfolio)?.name ?? 'All programmes';
  const pick = (v: string) => { setScope({ portfolio: v }); setAnchor(null); };
  return (
    <>
      <ButtonBase
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-label={`Portfolio scope: ${current}`}
        aria-haspopup="menu"
        sx={(t) => ({
          display: { xs: 'none', md: 'inline-flex' }, alignItems: 'center', gap: 0.75, px: 1, py: 0.5, borderRadius: 1, maxWidth: 280,
          bgcolor: t.palette.nav.surface, color: t.palette.common.white, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.03em',
          '&:hover': { bgcolor: t.palette.primary.light },
        })}
      >
        <HubIcon sx={(t) => ({ fontSize: 16, color: t.palette.brand.accentHover })} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current}</span>
        <ExpandMoreIcon sx={(t) => ({ fontSize: 16, color: t.palette.nav.text })} />
      </ButtonBase>
      <Menu open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <MenuItem selected={scope.portfolio === 'All programmes'} onClick={() => pick('All programmes')}>All programmes</MenuItem>
        {(programmes.data ?? []).map((p) => <MenuItem key={p.id} selected={scope.portfolio === p.id} onClick={() => pick(p.id)}>{p.name}</MenuItem>)}
      </Menu>
    </>
  );
}
