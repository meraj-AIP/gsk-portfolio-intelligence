import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Tone } from './StatusChip';

export type Stage = {
  key: string;
  label: string;
  count: number;
  meta?: string;
  footLeft: string;
  footRight?: { text: string; tone: Tone };
  /** completed: passed gate, navy; active: where attention sits now, orange; upcoming: neutral. */
  state: 'completed' | 'active' | 'upcoming';
  /** Share of the stage's work that is moving (0 to 100); drawn as the thin rule. */
  fill: number;
};

type Props = { stages: Stage[]; selected?: string; onSelect?: (key: string) => void };

/** Segmented stage-gate visualiser from the reference design, one tile per lifecycle stage. */
export function StageGateTrack({ stages, selected, onSelect }: Props) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: `repeat(${stages.length}, 1fr)` }, gap: 1 }}>
      {stages.map((s, i) => {
        const active = s.state === 'active';
        return (
          <ButtonBase
            key={s.key}
            onClick={onSelect ? () => onSelect(s.key) : undefined}
            disabled={!onSelect}
            aria-pressed={selected === s.key}
            sx={(t) => ({
              display: 'block', textAlign: 'left', p: 1.25, borderRadius: 2, bgcolor: active ? t.palette.tint.accent.bg : t.palette.brand.canvas,
              outline: active || selected === s.key ? `1px solid ${t.palette.brand.accent}66` : 'none', '&:hover': { bgcolor: t.palette.brand.hover },
              '&.Mui-disabled': { color: 'inherit' },
            })}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="overline" sx={(t) => ({ color: active ? t.palette.brand.accent : t.palette.brand.navy })}>{i + 1}. {s.label}</Typography>
              <Box aria-hidden sx={(t) => ({ width: 8, height: 8, borderRadius: '50%', bgcolor: active ? t.palette.brand.accent : s.state === 'completed' ? t.palette.success.main : t.palette.text.disabled })} />
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Typography variant="h2" component="span" sx={{ fontWeight: 700 }}>{s.count}</Typography>
              {s.meta ? <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>{s.meta}</Typography> : null}
            </Stack>
            <Box sx={(t) => ({ mt: 1, height: 4, borderRadius: 9999, bgcolor: t.palette.divider, overflow: 'hidden' })}>
              <Box sx={(t) => ({ height: '100%', width: `${s.fill}%`, borderRadius: 9999, bgcolor: active ? t.palette.brand.accent : s.state === 'completed' ? t.palette.brand.navy : t.palette.text.disabled })} />
            </Box>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 1, gap: 1 }}>
              <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>{s.footLeft}</Typography>
              {s.footRight ? <Typography sx={(t) => ({ fontSize: '0.6875rem', fontWeight: 600, color: t.palette.tint[s.footRight!.tone].fg })}>{s.footRight.text}</Typography> : null}
            </Stack>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

/** Small legend matching the track: completed gate, active flow, downstream. */
export function StageLegend() {
  const item = (label: string, kind: 'navy' | 'accent' | 'muted') => (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }} key={label}>
      <Box aria-hidden sx={(t) => ({ width: 10, height: 10, borderRadius: 0.5, bgcolor: kind === 'navy' ? t.palette.brand.navy : kind === 'accent' ? t.palette.brand.accent : t.palette.divider })} />
      <Typography variant="label" sx={{ color: 'text.secondary' }}>{label}</Typography>
    </Stack>
  );
  return <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }}>{[item('Gate passed', 'navy'), item('Needs attention', 'accent'), item('Not reached', 'muted')]}</Stack>;
}
