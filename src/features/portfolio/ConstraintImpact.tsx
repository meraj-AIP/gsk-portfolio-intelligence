import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Tone } from '@/shared/components/ui/StatusChip';

type Block = { label: string; basis: string; text: string; tone: Tone; inferred?: boolean };

function ImpactBlock({ label, basis, text, tone, inferred = false }: Block) {
  return (
    <Box sx={(t) => ({
      height: '100%', p: 1.25, borderRadius: 1, bgcolor: t.palette.tint[tone].bg,
      border: `1px ${inferred ? 'dashed' : 'solid'} ${inferred ? t.palette.tint[tone].fg : 'transparent'}`,
    })}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
        {inferred ? <AutoAwesomeIcon aria-hidden sx={(t) => ({ fontSize: 14, color: t.palette.tint[tone].fg })} /> : null}
        <Typography variant="overline" sx={(t) => ({ color: t.palette.tint[tone].fg })}>{label}</Typography>
      </Stack>
      <Typography sx={(t) => ({ fontSize: '0.6875rem', fontWeight: 600, color: t.palette.tint[tone].fg, opacity: 0.85, mb: 0.5 })}>{basis}</Typography>
      <Typography variant="body2" sx={{ fontStyle: inferred ? 'italic' : 'normal', color: text ? 'text.primary' : 'text.secondary' }}>{text || 'Nothing recorded'}</Typography>
    </Box>
  );
}

/** `stacked` keeps one column for narrow side panels. */
type Props = { confirmed: string; ownerReported: string; inferred: string; owner: string; stacked?: boolean };

/**
 * The three kinds of impact side by side and never merged. Each has its own tint; the AI inference also carries a
 * dashed edge, a spark icon and italic text so it cannot be read as a recorded fact.
 */
export function ConstraintImpact({ confirmed, ownerReported, inferred, owner, stacked = false }: Props) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: stacked ? '1fr' : 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>
      <ImpactBlock label="Confirmed impact" basis="Recorded effect" text={confirmed} tone="info" />
      <ImpactBlock label="Owner reported" basis={`Statement by ${owner}`} text={ownerReported} tone="neutral" />
      <ImpactBlock label="Inferred exposure" basis="AI inferred, not a reported fact" text={inferred} tone="accent" inferred />
    </Box>
  );
}
