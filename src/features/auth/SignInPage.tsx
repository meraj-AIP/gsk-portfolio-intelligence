import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GskLogo } from '@/shared/components/GskLogo';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { landingPath } from '@/shared/lib/permissions';
import type { User } from '@/shared/types/workflow';
import { ACCOUNTS } from './accounts';
import { useAuth } from './AuthContext';

function AccountPicker({ onPick, onBack }: { onPick: (a: User) => void; onBack: () => void }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="overline" component="p" sx={{ mb: 1 }}>Pick an account</Typography>
      <Stack sx={(t) => ({ border: `1px solid ${t.palette.divider}`, borderRadius: 1, overflow: 'hidden' })}>
        {ACCOUNTS.map((a, i) => (
          <ButtonBase key={a.id} onClick={() => onPick(a)}
            sx={(t) => ({ justifyContent: 'space-between', gap: 1, px: 1.5, py: 1.25, textAlign: 'left', borderTop: i ? `1px solid ${t.palette.divider}` : 'none', '&:hover': { bgcolor: t.palette.brand.hover } })}>
            <AvatarName name={a.name} subtitle={a.email} size={32} />
            <StatusChip tone="neutral" dot={false}>{a.role}</StatusChip>
          </ButtonBase>
        ))}
      </Stack>
      <Button sx={{ mt: 1.5 }} variant="text" onClick={onBack}>Back</Button>
    </Box>
  );
}

/** Tenant sign-in on the navy brand ground. The account list stands in for the Entra ID account picker. */
export function SignInPage() {
  const { user, signIn, signedOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [picking, setPicking] = useState(false);
  const from = signedOut ? undefined : (location.state as { from?: string } | null)?.from;
  if (user) return <Navigate to={from ?? landingPath(user)} replace />;
  const pick = (a: User) => { signIn(a); navigate(from ?? landingPath(a), { replace: true }); };
  return (
    <Box sx={(t) => ({ minHeight: '100vh', bgcolor: t.palette.nav.background, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 })}>
      <Paper sx={{ width: '100%', maxWidth: picking ? 520 : 440, p: { xs: 3, sm: 4 }, borderRadius: 2, boxShadow: 6, border: 'none' }}>
        <GskLogo width={112} />
        <Typography variant="overline" component="p" sx={{ mt: 3 }}>Enterprise Data and AI</Typography>
        <Typography variant="h1" component="h1">Portfolio workspace</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>Sign in with your GSK account to open the portfolio workspace.</Typography>
        {picking ? <AccountPicker onPick={pick} onBack={() => setPicking(false)} /> : (
          <Stack sx={{ gap: 1.5, mt: 3 }}>
            <Button variant="contained" color="secondary" size="large" startIcon={<MicrosoftIcon />} onClick={() => setPicking(true)} sx={{ minHeight: 44 }}>Sign in with Microsoft</Button>
            <Typography variant="caption">Access is granted by your directory group. Contact the portfolio office if your role is missing.</Typography>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
