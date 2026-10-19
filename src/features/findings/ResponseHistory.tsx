import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import type { Evidence, Finding } from '@/shared/types/domain';
import { muted } from './JourneyParts';

/**
 * Responses only store the finding version, so the evidence version is the latest one dated on or before the response.
 * Undefined means the record has no version that old, which is shown rather than guessed.
 */
export function evidenceVersionAt(e: Evidence, date: string): number | undefined {
  const versions = [...(e.history ?? []).map((h) => ({ version: h.version, date: h.date })), { version: e.version, date: e.date }];
  return versions.filter((v) => v.date.slice(0, 10) <= date.slice(0, 10)).sort((a, b) => b.version - a.version)[0]?.version;
}

function referredTo(evidence: Evidence[], date: string): string {
  if (!evidence.length) return 'No evidence record linked.';
  return `Read against ${evidence.map((e) => {
    const v = evidenceVersionAt(e, date);
    return v === undefined ? `${e.id} (version not known at that date)` : `${e.id} v${v}${v !== e.version ? `, now v${e.version}` : ''}`;
  }).join('; ')}.`;
}

/** Every response stays on record, including challenges, so a rejected interpretation is never silently dropped. */
export function ResponseHistory({ f, evidence }: { f: Finding; evidence: Evidence[] }) {
  if (!f.responses.length) return <Typography variant="body2" sx={muted}>No owner response recorded yet.</Typography>;
  return (
    <Stack sx={{ gap: 1 }}>
      {f.responses.map((r) => (
        <Box key={r.id} sx={(t) => ({ p: 1.25, borderRadius: 1, bgcolor: t.palette.tint.neutral.bg, border: `1px solid ${t.palette.divider}` })}>
          <Typography variant="overline" component="p">Owner conclusion</Typography>
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2"><strong>{r.action}</strong> by {r.reviewer}, {formatDate(r.date)}, against finding version {r.findingVersion}</Typography>
            {r.action === 'challenged' ? <StatusChip tone="warning">Challenged, kept on record</StatusChip> : null}
            {r.findingVersion !== f.version ? <StatusChip tone="neutral" dot={false}>Finding has changed since</StatusChip> : null}
          </Stack>
          <Typography variant="body2">{r.note}</Typography>
          <Typography variant="caption">{referredTo(evidence, r.date)}</Typography>
        </Box>
      ))}
    </Stack>
  );
}
