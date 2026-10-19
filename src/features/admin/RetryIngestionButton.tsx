import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/features/auth/AuthContext';
import { useRetryIngestion } from '@/shared/api/hooks';
import { can } from '@/shared/lib/permissions';
import type { Source } from '@/shared/types/domain';
import { needsRetry } from './sourceIssues';

/** Offered only on failed or degraded feeds; a healthy feed has nothing to retry. */
export function RetryIngestionButton({ source }: { source: Source }) {
  const { user } = useAuth();
  const retry = useRetryIngestion();
  if (!needsRetry(source)) return null;
  const allowed = can(user, 'retry ingestion');
  return (
    <Stack sx={{ gap: 0.5 }}>
      <Button size="small" variant="outlined" disabled={!allowed || retry.isPending} onClick={() => retry.mutate(source.id)}>
        {retry.isPending ? 'Retrying' : 'Retry ingestion'}
      </Button>
      {!allowed ? <Typography variant="caption">Only the source's data owner can retry ingestion.</Typography> : null}
      {retry.isError ? <Alert severity="error">{retry.error.message}</Alert> : null}
    </Stack>
  );
}
