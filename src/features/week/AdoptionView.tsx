import Box from '@mui/material/Box';
import { ProgressLine } from '@/shared/components/ui/Controls';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Release } from '@/shared/types/domain';

/** Availability and adoption, kept apart: enabled users are not active users. */
export function AdoptionView({ release }: { release: Release }) {
  const available = release.events.find((e) => e.kind === 'available');
  const enabled = release.enabledTeams.length;
  const a = release.adoption;
  const enabledUsers = Number(/\d+/.exec(available?.note ?? '')?.[0] ?? 0);
  const pct = enabledUsers && a ? Math.min(100, Math.round((a.activeUsers / enabledUsers) * 100)) : null;
  return (
    <Box>
      <Typography variant="overline" component="p" sx={{ mb: 0.5 }}>Availability and adoption</Typography>
      <Typography variant="body2">{available ? `Available since ${available.date} to ${enabled} team${enabled === 1 ? '' : 's'}: ${release.enabledTeams.join(', ')}.` : 'Not yet available to the business.'}</Typography>
      {a ? (
        <Stack sx={{ gap: 0.5, mt: 0.75 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>{a.activeUsers} active{enabledUsers ? ` of ${enabledUsers} enabled` : ''}</Typography>
            <Typography variant="caption">{a.period}{a.early ? ', early evidence' : ''}</Typography>
          </Stack>
          {pct !== null ? <ProgressLine caption={`${pct}% of enabled users active, calculated`} value={pct} /> : null}
          <Typography variant="caption">{a.note}</Typography>
        </Stack>
      ) : <Typography variant="caption">No adoption evidence recorded.</Typography>}
    </Box>
  );
}
