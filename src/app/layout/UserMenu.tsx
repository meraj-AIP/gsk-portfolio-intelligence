import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!user) return null;
  return (
    <>
      <IconButton aria-label="Account menu" onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
        <Avatar sx={(t) => ({ width: 32, height: 32, bgcolor: t.palette.nav.surface, color: t.palette.common.white, fontSize: '0.75rem', fontWeight: 700 })}>{user.initials}</Avatar>
      </IconButton>
      <Menu open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2">{user.name}</Typography>
          <Typography variant="caption" sx={{ display: 'block' }}>{user.email}</Typography>
          <Typography variant="caption">{user.role}, {user.team}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchor(null); navigate('/decisions'); }}>My responses and actions</MenuItem>
        <MenuItem onClick={() => { setAnchor(null); navigate('/sources'); }}>Data sources and freshness</MenuItem>
        <Divider />
        <MenuItem onClick={() => { setAnchor(null); signOut(); navigate('/sign-in'); }}>Sign out</MenuItem>
      </Menu>
    </>
  );
}
