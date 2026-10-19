import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import type { Definition } from '@/shared/types/domain';

type Props = { area: string; defs: Definition[]; selectedId: string; onSelect: (id: string) => void };

/** One reference card per area; each definition is a selectable row with its version and effective date. */
export function DefinitionArea({ area, defs, selectedId, onSelect }: Props) {
  return (
    <SectionCard title={area} badge={`${defs.length} definition${defs.length === 1 ? '' : 's'}`} dense>
      <Stack sx={{ gap: 1 }}>
        {defs.map((d) => {
          const on = d.id === selectedId;
          return (
            <ButtonBase key={d.id} onClick={() => onSelect(d.id)} aria-pressed={on}
              sx={(t) => ({
                display: 'block', textAlign: 'left', p: 1.5, borderRadius: 1, border: `1px solid ${on ? t.palette.brand.accent : t.palette.divider}`,
                bgcolor: on ? t.palette.tint.accent.bg : t.palette.background.paper, '&:hover': { bgcolor: on ? t.palette.tint.accent.bg : t.palette.brand.hover },
              })}>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle1" component="span" sx={{ flex: 1, fontSize: '0.875rem' }}>{d.name}</Typography>
                <StatusChip tone="info" square dot={false}>v{d.version}</StatusChip>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>{d.value}</Typography>
              <Typography variant="caption" component="p" sx={{ mt: 0.5 }}>{d.id}, owned by {d.owner}, effective {formatDate(d.effectiveDate)}</Typography>
            </ButtonBase>
          );
        })}
      </Stack>
    </SectionCard>
  );
}
