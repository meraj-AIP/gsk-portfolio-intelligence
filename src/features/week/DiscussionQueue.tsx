import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { SectionCard } from '@/shared/components/SectionCard';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import type { Lifecycle } from '@/shared/lib/journey';
import { GROUP_ORDER, itemStatus, shortDate, weekLabel, type QueueItem, type ReviewPeriod } from './weekModel';

export type Conclusion = { itemId: string; week: string; text: string; reviewer: string };

type Props = {
  items: QueueItem[];
  period: ReviewPeriod;
  selectedId: string | null;
  onSelect: (item: QueueItem) => void;
  week: string;
  conclusions: Conclusion[];
  lifecycles: Record<string, { stage: Lifecycle }>;
};

/** The latest conclusion recorded in an earlier review, so the discussion resumes where it stopped. */
const lastConclusion = (all: Conclusion[], itemId: string, week: string) =>
  all.filter((c) => c.itemId === itemId && c.week < week).sort((a, b) => b.week.localeCompare(a.week))[0];

function Continuity({ it, week, conclusions, lifecycles }: { it: QueueItem } & Pick<Props, 'week' | 'conclusions' | 'lifecycles'>) {
  const previous = lastConclusion(conclusions, it.id, week);
  const stage = it.findingId ? lifecycles[it.findingId]?.stage : undefined;
  if (!it.openSince && !previous && !stage) return null;
  return (
    <Box sx={(t) => ({ mt: 1, px: 1, py: 0.75, borderRadius: 0.5, bgcolor: t.palette.brand.canvas })}>
      {it.openSince || stage ? (
        <Typography variant="caption" sx={{ display: 'block' }}>
          {[it.openSince ? `Open since ${weekLabel(it.openSince).toLowerCase()}` : '', stage ? `Finding ${it.findingId}: ${stage}` : ''].filter(Boolean).join('. ')}
        </Typography>
      ) : null}
      {previous ? <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>{weekLabel(previous.week)} conclusion ({previous.reviewer}): {previous.text}</Typography> : null}
    </Box>
  );
}

function Row({ it, selected, onSelect, period, ...context }: { it: QueueItem; selected: boolean; onSelect: () => void } & Pick<Props, 'period' | 'week' | 'conclusions' | 'lifecycles'>) {
  const status = itemStatus(it, period);
  return (
    <ButtonBase onClick={onSelect} aria-pressed={selected}
      sx={(t) => ({
        display: 'block', textAlign: 'left', width: '100%', px: 1.5, py: 1.25, border: 1, borderRadius: 1,
        borderColor: selected ? t.palette.brand.accent : t.palette.divider, bgcolor: selected ? t.palette.tint.accent.bg : t.palette.background.paper,
        boxShadow: selected ? `0 0 0 3px ${alpha(t.palette.brand.accent, 0.15)}` : 'none',
        '&:hover': { borderColor: t.palette.brand.borderProminent }, '&:focus-visible': { outline: `2px solid ${t.palette.brand.accent}` },
      })}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="overline" component="p">{it.projectName}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{it.title}</Typography>
          <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{it.previous}</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>to</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{it.current}</Typography>
            {it.receivedDate && it.receivedDate !== it.date ? <StatusChip tone="info" dot={false} square>Event {shortDate(it.date)}, received {shortDate(it.receivedDate)}</StatusChip> : null}
          </Stack>
        </Box>
        <Stack sx={{ alignItems: { sm: 'flex-end' }, gap: 1, flexShrink: 0 }}>
          <StatusChip tone={status.tone}>{status.text}</StatusChip>
          {it.owner ? <AvatarName name={it.owner} subtitle="Owner" size={24} /> : null}
        </Stack>
      </Stack>
      <Continuity it={it} {...context} />
    </ButtonBase>
  );
}

/** Items with a finding open the finding journey; everything else opens the item panel. Both carry their history forward. */
export function DiscussionQueue({ items, selectedId, onSelect, ...context }: Props) {
  return (
    <Stack sx={{ gap: 2 }}>
      {GROUP_ORDER.map((group) => {
        const rows = items.filter((i) => i.group === group);
        return (
          <SectionCard key={group} title={group} badge={String(rows.length)} dense>
            {rows.length === 0 ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>Nothing in this group.</Typography> : (
              <Stack sx={{ gap: 1 }}>
                {rows.map((it) => <Row key={it.id} it={it} selected={it.id === selectedId} onSelect={() => onSelect(it)} {...context} />)}
              </Stack>
            )}
          </SectionCard>
        );
      })}
    </Stack>
  );
}
