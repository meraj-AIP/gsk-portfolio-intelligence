import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GskLogo } from '@/shared/components/GskLogo';
import { landingPath } from '@/shared/lib/permissions';
import { ACCOUNTS } from './accounts';
import { useAuth } from './AuthContext';

/** Tenant sign-in. The account list stands in for the Entra ID account picker. */
export function SignInPage() {
  const { user, signIn, signedOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [picking, setPicking] = useState(false);
  const from = signedOut ? undefined : (location.state as { from?: string } | null)?.from;
  if (user) return <Navigate to={from ?? landingPath(user)} replace />;
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'nav.background', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 440, p: { xs: 3, sm: 4 } }}>
        <GskLogo width={120} />
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>Enterprise Data and AI. Sign in with your GSK account to open the portfolio workspace.</Typography>
        {!picking ? (
          <Stack sx={{ gap: 1.5, mt: 3 }}>
            <Button variant="contained" size="large" onClick={() => setPicking(true)}>Sign in with Microsoft</Button>
            <Typography variant="caption">Access is granted by your directory group. Contact the portfolio office if your role is missing.</Typography>
          </Stack>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Pick an account</Typography>
            <List dense disablePadding sx={{ border: 1, borderColor: 'divider', borderRadius: 0.5 }}>
              {ACCOUNTS.map((a) => (
                <ListItemButton key={a.id} onClick={() => { signIn(a); navigate(from ?? landingPath(a), { replace: true }); }} divider>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, mr: 1.5 }}>{a.initials}</Box>
                  <ListItemText primary={a.name} secondary={`${a.email}. ${a.role}, ${a.team}`} />
                </ListItemButton>
              ))}
            </List>
            <Button sx={{ mt: 1 }} onClick={() => setPicking(false)}>Back</Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
