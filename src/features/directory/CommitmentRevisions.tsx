import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Commitment } from '@/shared/types/domain';
import { EmptyState } from '@/shared/components/StatePanels';
import { formatDate } from '@/shared/lib/format';

const block = { p: 1, border: 1, borderColor: 'divider', borderRadius: 0.5, minWidth: 140 } as const;

/** Original, each revision, current and actual sit in separate boxes so a moved date never reads as the plan. */
export function CommitmentRevisions({ commitments }: { commitments: Commitment[] }) {
  const revised = commitments.filter((c) => c.revisions?.length || c.currentDate !== c.baselineDate);
  if (!revised.length) return <EmptyState title="No commitment has been revised" hint="Every current date matches the original plan." />;
  return (
    <Stack sx={{ gap: 2 }}>
      {revised.map((c) => (
        <Box key={c.id}>
          <Typography variant="subtitle2">{c.title}</Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mt: 0.75 }}>
            <Box sx={block}><Typography variant="caption">Original</Typography><Typography variant="body2">{formatDate(c.baselineDate)}</Typography></Box>
            {(c.revisions ?? []).map((r) => (
              <Box key={r.date} sx={{ ...block, borderStyle: 'dashed', maxWidth: 260 }}>
                <Typography variant="caption">Revised {formatDate(r.date)}</Typography>
                <Typography variant="body2">{formatDate(r.from)} to {formatDate(r.to)}</Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>Reason: {r.reason}</Typography>
              </Box>
            ))}
            <Box sx={{ ...block, borderColor: c.actualDate ? 'divider' : 'condition.attention' }}><Typography variant="caption">Current</Typography><Typography variant="body2">{formatDate(c.currentDate)}</Typography></Box>
            <Box sx={{ ...block, borderColor: 'divider' }}><Typography variant="caption">Actual</Typography><Typography variant="body2">{c.actualDate ? formatDate(c.actualDate) : 'Not yet'}</Typography></Box>
          </Stack>
          {!c.revisions?.length ? <Typography variant="caption">The date moved but no revision record with a reason was received.</Typography> : null}
        </Box>
      ))}
    </Stack>
  );
}
