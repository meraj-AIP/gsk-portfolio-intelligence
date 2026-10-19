import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import type { Evidence } from '@/shared/types/domain';

/** Each limitation gets its own notice because each needs a different response from the reader. */
export function EvidenceNotices({ e }: { e: Evidence }) {
  const restricted = e.permission === 'restricted';
  return (
    <Stack sx={{ gap: 1 }}>
      {restricted ? (
        <Alert severity="warning">
          <AlertTitle>Restricted record</AlertTitle>
          Your permissions show that this record exists and who owns it, but not its content. Ask {e.owner} for access if you need the excerpt or fields.
        </Alert>
      ) : null}
      {!e.originalAvailable ? (
        <Alert severity="error">
          <AlertTitle>Original unavailable</AlertTitle>
          The original record can no longer be opened in {e.source}. {restricted ? '' : 'The excerpt below is the copy captured at ingestion and cannot be rechecked against the source.'}
        </Alert>
      ) : null}
      {e.anchor?.status === 'broken' ? (
        <Alert severity="warning">
          <AlertTitle>Broken anchor</AlertTitle>
          The link to &quot;{e.anchor.label}&quot; no longer resolves. The source exists, but the exact location may have moved or been edited since the excerpt was taken.
        </Alert>
      ) : null}
      {e.stale ? (
        <Alert severity="warning">
          <AlertTitle>Stale record</AlertTitle>
          This record has not been refreshed within its expected cycle. A newer version may exist in {e.source} that has not reached this workspace.
        </Alert>
      ) : null}
    </Stack>
  );
}
