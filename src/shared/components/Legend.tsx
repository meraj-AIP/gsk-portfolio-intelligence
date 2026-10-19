import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Condition } from '@/shared/types/domain';
import { CONDITION_TONE } from './ConditionChip';

const ITEMS: { condition: Condition; text: string }[] = [
  { condition: 'met', text: 'On track' },
  { condition: 'attention', text: 'Needs attention' },
  { condition: 'breached', text: 'Breached' },
  { condition: 'reported', text: 'Reported, not assessed' },
  { condition: 'unknown', text: 'Insufficient information' },
];

/** Square swatch legend in the reference style; every tone on screen is explained here. */
export function Legend({ extra }: { extra?: string }) {
  return (
    <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      {ITEMS.map(({ condition, text }) => (
        <Stack key={condition} direction="row" sx={{ gap: 0.75, alignItems: 'center' }}>
          <Box aria-hidden sx={(t) => ({ width: 10, height: 10, borderRadius: 0.5, bgcolor: t.palette.tint[CONDITION_TONE[condition]].fg })} />
          <Typography variant="label" sx={{ color: 'text.secondary' }}>{text}</Typography>
        </Stack>
      ))}
      {extra ? <Typography variant="caption">{extra}</Typography> : null}
    </Stack>
  );
}
