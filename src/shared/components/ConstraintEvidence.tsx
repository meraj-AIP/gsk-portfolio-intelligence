import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useEvidence } from '@/shared/api/hooks';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { formatDate } from '@/shared/lib/format';

/**
 * The evidence excerpt inline, so a statement can be checked without leaving the trace, with the full record one click away.
 * Also used by the release panel on This week; a candidate for shared/components.
 */
export function ConstraintEvidence({ id }: { id: string }) {
  const evidence = useEvidence(id);
  const [, openEvidence] = useUrlParam('evidence');
  if (!id) return <Typography variant="caption">No evidence linked.</Typography>;
  if (evidence.isError) return <Typography variant="caption" sx={{ color: 'error.main' }}>Evidence {id} could not be loaded.</Typography>;
  if (evidence.isLoading) return <Typography variant="caption" sx={{ color: 'text.secondary' }}>Loading evidence {id}.</Typography>;
  const e = evidence.data;
  if (!e) return <Typography variant="caption">Evidence {id} is not in this workspace.</Typography>;
  return (
    <Box component="figure" sx={{ m: 0, p: 1, bgcolor: 'background.default', borderRadius: 0.5 }}>
      <Typography component="blockquote" variant="body2" sx={{ m: 0 }}>&quot;{e.excerpt}&quot;</Typography>
      <Typography component="figcaption" variant="caption" sx={{ display: 'block', mt: 0.5 }}>
        {e.source}, {e.owner}, {formatDate(e.date)}{e.stale ? ', may be out of date' : ''}.{' '}
        <Link component="button" type="button" variant="caption" onClick={() => openEvidence(e.id)}>Open full record {e.id}</Link>
      </Typography>
    </Box>
  );
}
