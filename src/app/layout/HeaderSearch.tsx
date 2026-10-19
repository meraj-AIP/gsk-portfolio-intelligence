import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

/** Searches programmes and projects by name, objective, owner, capability, dependency or release. */
export function HeaderSearch() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/directory?q=${encodeURIComponent(q.trim())}`);
  };
  return (
    <Box component="form" role="search" onSubmit={submit} sx={{ flex: 1, maxWidth: 560, mx: 2, display: { xs: 'none', md: 'block' } }}>
      <Box sx={(t) => ({ position: 'relative', display: 'flex', alignItems: 'center', height: 36, borderRadius: 1, bgcolor: t.palette.nav.surface, '&:focus-within': { boxShadow: `0 0 0 1px ${t.palette.secondary.light}` } })}>
        <SearchIcon aria-hidden sx={(t) => ({ position: 'absolute', left: 10, fontSize: 18, color: t.palette.nav.text })} />
        <InputBase
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search programmes, projects, owners, releases"
          inputProps={{ 'aria-label': 'Search programmes and projects' }}
          sx={(t) => ({ width: '100%', pl: 4.5, pr: 1.5, color: t.palette.common.white, fontSize: '0.8125rem', '& input::placeholder': { color: t.palette.nav.text, opacity: 1 } })}
        />
      </Box>
    </Box>
  );
}
