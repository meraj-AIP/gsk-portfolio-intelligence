import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatDate } from '@/shared/lib/format';
import type { Finding } from '@/shared/types/domain';

export type ViewedVersion = Pick<Finding, 'version' | 'currentPosition' | 'significance'>;

function Change({ label, before, after }: { label: string; before: string; after: string }) {
  if (before === after) return <Typography variant="body2"><strong>{label}:</strong> unchanged.</Typography>;
  return (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>{before}</Typography>
      <Typography variant="body2">{after}</Typography>
    </Box>
  );
}

type Props = { viewed: ViewedVersion; current: Finding; busy: boolean; onResubmit: () => void };

/** Shown when the finding moved on while a response was being drafted. The draft is kept; the user decides whether it still holds. */
export function VersionChangeNotice({ viewed, current, busy, onResubmit }: Props) {
  const between = (current.versions ?? []).filter((v) => v.version > viewed.version);
  return (
    <Alert severity="warning" variant="outlined">
      <Stack sx={{ gap: 1 }}>
        <Typography variant="body2">You were viewing version {viewed.version}. The finding is now version {current.version}. Your draft is kept below. Check what changed before you resubmit.</Typography>
        <Change label="Current position" before={viewed.currentPosition} after={current.currentPosition} />
        <Change label="Significance" before={viewed.significance} after={current.significance} />
        {between.length ? (
          <Box>
            <Typography variant="caption">Versions since yours</Typography>
            {between.map((v) => <Typography key={v.version} variant="body2">v{v.version}, {formatDate(v.date)}: {v.currentPosition}</Typography>)}
          </Box>
        ) : null}
        <Box><Button variant="contained" size="small" disabled={busy} onClick={onResubmit}>Resubmit against version {current.version}</Button></Box>
      </Stack>
    </Alert>
  );
}
