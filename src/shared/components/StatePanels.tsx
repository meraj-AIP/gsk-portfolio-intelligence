import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <Stack sx={{ gap: 1 }} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={40} sx={{ borderRadius: 1 }} />
      ))}
    </Stack>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Box role="alert" sx={(t) => ({ p: 2, borderRadius: 2, bgcolor: t.palette.tint.danger.bg, border: `1px solid ${t.palette.tint.danger.fg}33` })}>
      <Typography variant="subtitle1" sx={(t) => ({ color: t.palette.tint.danger.fg })}>Something went wrong</Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>{message}</Typography>
      {onRetry ? <Button sx={{ mt: 1.5 }} variant="outlined" onClick={onRetry}>Try again</Button> : null}
    </Box>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <Box sx={(t) => ({ p: 3, textAlign: 'center', borderRadius: 2, bgcolor: t.palette.brand.canvas, border: `1px dashed ${t.palette.brand.borderProminent}` })}>
      <Typography variant="subtitle1">{title}</Typography>
      {hint ? <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{hint}</Typography> : null}
    </Box>
  );
}
