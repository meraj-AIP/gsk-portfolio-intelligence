import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { TrailPoint } from '@/shared/lib/journey';
import type { Finding } from '@/shared/types/domain';
import { Step, muted } from './JourneyParts';
import { StatementFrame } from '@/shared/components/ui/Statement';

const shortWeek = (week: string) => week.replace(/^\d{4}-/, '');

/** One line per review so a carried item shows how it got here, not just where it is now. */
function Trail({ trail }: { trail: TrailPoint[] }) {
  if (!trail.length) return <Typography variant="body2" sx={muted}>No weekly reviews recorded yet.</Typography>;
  return (
    <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {trail.map((p) => (
        <Box component="li" key={p.snapshotId} sx={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 1, py: 0.5, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ fontWeight: p.changed ? 700 : 400 }}>{shortWeek(p.week)}</Typography>
          <Typography variant="body2" sx={p.present ? undefined : muted}>
            {p.present ? p.position : 'Not raised in this review.'}
            {p.changed ? <strong> Changed this week.</strong> : null}
            {p.status === 'open' ? <Box component="span" sx={muted}> Open review.</Box> : null}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export function StepChange({ f, trail }: { f: Finding; trail: TrailPoint[] }) {
  const changes = trail.filter((p) => p.changed).length;
  const lead = `First seen ${shortWeek(f.firstSeenWeek)}. ${changes ? `Position changed in ${changes} review${changes === 1 ? '' : 's'} since.` : 'Position has not changed between reviews.'}`;
  return (
    <Step n={1} title="What changed" lead={lead}>
      <StatementFrame type={f.statementType}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 2 }}>
          <Box sx={{ flex: 1 }}><Typography variant="overline" component="p">Previous position</Typography><Typography variant="body2">{f.previousPosition}</Typography></Box>
          <Box sx={{ flex: 1 }}><Typography variant="overline" component="p">Current position</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{f.currentPosition}</Typography></Box>
        </Stack>
      </StatementFrame>
      <Box>
        <Typography variant="overline" component="p" sx={{ mb: 0.5 }}>Position in each weekly review</Typography>
        <Trail trail={trail} />
      </Box>
    </Step>
  );
}
