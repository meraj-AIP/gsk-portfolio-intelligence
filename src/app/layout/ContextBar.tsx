import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import HistoryIcon from '@mui/icons-material/History';
import { useReview } from '@/app/context/ReviewContext';
import { useSnapshots } from '@/shared/api/hooks';
import { formatDate } from '@/shared/lib/format';

/** The review being viewed and the review it is compared with. Every figure on every screen follows these two. */
export function ContextBar() {
  const { scope, setScope, viewSnapshot, comparisonOptions } = useReview();
  const snapshots = useSnapshots();
  const reviews = [...(snapshots.data ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Box sx={(t) => ({ bgcolor: t.palette.background.paper, borderBottom: `1px solid ${t.palette.divider}`, px: { xs: 2, md: 4 }, py: 1 })}>
      <Stack direction="row" sx={{ maxWidth: 1280, mx: 'auto', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="overline" sx={{ mr: 0.5 }}>Review</Typography>
          <TextField select aria-label="Review" value={scope.viewSnapshotId} onChange={(e) => setScope({ viewSnapshotId: e.target.value })} sx={{ minWidth: 200 }} disabled={!reviews.length}>
            {reviews.map((s) => <MenuItem key={s.id} value={s.id}>{s.label}{s.status === 'amended' ? ', amended' : ''}</MenuItem>)}
          </TextField>
          <Typography variant="overline" sx={{ ml: 1, mr: 0.5 }}>Compare with</Typography>
          <TextField select aria-label="Compare with" value={scope.comparisonSnapshotId} onChange={(e) => setScope({ comparisonSnapshotId: e.target.value })} sx={{ minWidth: 170 }} disabled={!comparisonOptions.length}>
            {comparisonOptions.length ? comparisonOptions.map((s) => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>) : <MenuItem value="">No earlier review</MenuItem>}
          </TextField>
        </Stack>
        {viewSnapshot ? (
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
            <HistoryIcon sx={{ fontSize: 16 }} />
            <Typography variant="label">Reporting date <strong>{formatDate(viewSnapshot.date)}</strong></Typography>
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}
