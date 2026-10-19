import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import type { Condition } from '@/shared/types/domain';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { CONDITION_SHORT } from '@/shared/lib/format';

type Props = { condition: Condition; label: string; was?: string | undefined; comparisonWeek: string; onClick: () => void; quiet?: boolean };

/** One project cell. A change since the comparison review is a neutral icon, never colour, and is spoken in the label. */
export function MatrixCell({ condition, label, was, comparisonWeek, onClick, quiet = false }: Props) {
  const change = was ? `Was ${was} in ${comparisonWeek}` : '';
  return (
    <ButtonBase onClick={onClick} aria-label={`${label}${change ? `. ${change.toLowerCase()}` : ''}`} sx={{ borderRadius: 0.5, px: 0.25 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25 }}>
        <ConditionChip condition={condition} compact quiet={quiet} />
        {was ? (
          <Tooltip title={`Changed. ${CONDITION_SHORT[was as Condition] ?? was} in ${comparisonWeek}`}>
            <ChangeCircleOutlinedIcon aria-hidden sx={{ color: 'text.disabled', fontSize: 14 }} />
          </Tooltip>
        ) : null}
      </Stack>
    </ButtonBase>
  );
}
