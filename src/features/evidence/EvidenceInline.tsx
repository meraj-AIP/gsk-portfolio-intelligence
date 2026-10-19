import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEvidence } from '@/shared/api/hooks';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { formatDate } from '@/shared/lib/format';
import type { Evidence } from '@/shared/types/domain';

/** Limitations written as plain sentences next to the excerpt, so the reader weighs them before reading it. */
function limitations(e: Evidence): string[] {
  return [
    e.permission === 'restricted' ? `Restricted. You can see that this record exists and that ${e.owner} owns it, but not its content.` : '',
    !e.originalAvailable ? `The original can no longer be opened in ${e.source}; this is the copy taken at ingestion.` : '',
    e.anchor?.status === 'broken' ? `The link to "${e.anchor.label}" no longer resolves, so the excerpt may have moved or been edited.` : '',
    e.stale ? 'Not refreshed within its expected cycle. A newer version may exist at source.' : '',
  ].filter(Boolean);
}

function Body({ e, compact }: { e: Evidence; compact: boolean }) {
  const [, open] = useUrlParam('evidence');
  const notes = limitations(e);
  const restricted = e.permission === 'restricted';
  return (
    <Box sx={(t) => ({ p: 1.25, borderRadius: 1, bgcolor: t.palette.background.paper, border: `1px solid ${t.palette.divider}` })}>
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
        {e.id}, {e.type}, {e.source}, {formatDate(e.date)}, version {e.version}, owner {e.owner}
      </Typography>
      {restricted ? null : <Typography variant="body2" sx={{ fontStyle: 'italic', my: 0.25 }}>&ldquo;{e.excerpt}&rdquo;</Typography>}
      {!compact && !restricted && e.context ? <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>{e.context}</Typography> : null}
      {notes.map((n) => <Typography key={n} variant="body2" sx={{ fontWeight: 600 }}>{n}</Typography>)}
      <Link component="button" type="button" variant="body2" onClick={() => open(e.id)}>Open full record and versions</Link>
    </Box>
  );
}

type Props = { id: string; record?: Evidence | undefined; compact?: boolean };

/** Evidence shown beside the statement it supports. The full record and version compare stay in the dialog (?evidence=). */
export function EvidenceInline({ id, record, compact = false }: Props) {
  // Skip the fetch when the caller already holds the record, which the journey read does for the finding's own evidence.
  const query = useEvidence(record ? '' : id);
  const e = record ?? query.data;
  if (e) return <Body e={e} compact={compact} />;
  if (query.isLoading) return <Skeleton variant="rounded" height={56} sx={{ borderRadius: 1 }} aria-label={`Loading ${id}`} />;
  return (
    <Stack sx={(t) => ({ p: 1.25, borderRadius: 1, bgcolor: t.palette.tint.warning.bg, border: `1px solid ${t.palette.divider}` })}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {query.isError ? `${id} could not be loaded: ${query.error.message}` : `${id} could not be resolved. The record may have been removed or your permissions may not cover it.`}
      </Typography>
      {query.isError ? <Link component="button" type="button" variant="body2" onClick={() => void query.refetch()} sx={{ alignSelf: 'flex-start' }}>Try again</Link> : null}
    </Stack>
  );
}
