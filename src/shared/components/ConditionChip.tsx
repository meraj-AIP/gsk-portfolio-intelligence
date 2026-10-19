import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import type { Condition } from '@/shared/types/domain';
import { CONDITION_LABEL, CONDITION_SHORT } from '@/shared/lib/format';
import { StatusChip, type Tone } from './ui/StatusChip';

type Props = {
  condition: Condition;
  label?: string;
  compact?: boolean;
  /** Render without tint, for a secondary mention in a row that already carries a status chip. */
  quiet?: boolean;
};

export const CONDITION_TONE: Record<Condition, Tone> = { met: 'success', attention: 'warning', breached: 'danger', reported: 'info', unknown: 'neutral' };

/** A condition as a tinted status pill in the reference design's four clinical tones; unknown keeps a dashed outline. */
export function ConditionChip({ condition, label, compact = false, quiet = false }: Props) {
  const text = label ?? CONDITION_SHORT[condition];
  return (
    <Tooltip title={CONDITION_LABEL[condition]}>
      <Box component="span" role="img" aria-label={`${text}: ${CONDITION_LABEL[condition]}`} sx={{ display: 'inline-flex', ...(condition === 'unknown' ? { '& > span': { outline: '1px dashed', outlineColor: 'text.disabled', outlineOffset: -1 } } : {}) }}>
        {quiet
          ? <Box component="span" sx={{ fontSize: compact ? '0.7rem' : '0.75rem', fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>{text}</Box>
          : <StatusChip tone={CONDITION_TONE[condition]} dot={!compact}>{text}</StatusChip>}
      </Box>
    </Tooltip>
  );
}
