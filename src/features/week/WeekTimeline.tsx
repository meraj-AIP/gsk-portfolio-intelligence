import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { addDays, type QueueItem, type ReviewPeriod } from './weekModel';

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const LANES: QueueItem['kind'][] = ['commitment', 'release', 'scope', 'finding'];
const LANE_LABEL: Record<QueueItem['kind'], string> = { commitment: 'Commitments', release: 'Releases', scope: 'Scope changes', finding: 'Findings raised' };

type Props = { items: QueueItem[]; period: ReviewPeriod; selectedId: string | null; onSelect: (item: QueueItem) => void };

const KEY = [
  { text: 'Change to understand or decision needed', colour: 'condition.attention' },
  { text: 'Owner response overdue', colour: 'condition.breached' },
  { text: 'Carried forward from an earlier week', hollow: true },
  { text: 'Everything else', colour: 'text.secondary' },
];

const dayOf = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay();

/** Weekly delivery timeline. Items dated outside the week sit at the edge with a marker so late-arriving information is visible. */
export function WeekTimeline({ items, period, selectedId, onSelect }: Props) {
  const theme = useTheme();
  const p = theme.palette;
  const DAYS = Array.from({ length: 8 }, (_, i) => addDays(period.start, i));
  const left = 120; const colW = 92; const laneH = 56; const top = 30;
  const width = left + DAYS.length * colW + 40;
  const height = top + LANES.length * laneH + 10;
  const xFor = (date: string) => {
    const i = DAYS.indexOf(date);
    if (i >= 0) return left + i * colW + colW / 2;
    return date < DAYS[0]! ? left + 8 : left + DAYS.length * colW - 8;
  };
  // Colour marks exceptions only: an overdue response is red, something to understand or decide is amber, the rest is neutral.
  const colour = (it: QueueItem) => {
    if (it.responseDue && it.responseDue < period.end) return p.condition.breached;
    if (it.group === 'Changes to understand' || it.group === 'Decisions and responses required') return p.condition.attention;
    return p.text.secondary;
  };
  const used = new Map<string, number>();
  return (
    <Box>
      <Box sx={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Weekly timeline of commitments, releases, scope changes and findings. The discussion queue lists the same items." style={{ minWidth: 760, width: '100%', fontFamily: theme.typography.fontFamily }}>
          {DAYS.map((d, i) => (
            <g key={d}>
              <line x1={left + i * colW} y1={top - 6} x2={left + i * colW} y2={height} stroke={p.divider} />
              <text x={left + i * colW + colW / 2} y={top - 12} fontSize={11} fontWeight={600} textAnchor="middle" fill={dayOf(d) === 0 || dayOf(d) === 6 ? p.text.disabled : p.text.secondary}>{`${WEEKDAY[dayOf(d)]} ${Number(d.slice(8))}`}</text>
            </g>
          ))}
          {LANES.map((lane, li) => (
            <g key={lane}>
              <text x={8} y={top + li * laneH + laneH / 2 + 4} fontSize={10.5} fontWeight={700} letterSpacing={0.6} fill={p.text.secondary}>{LANE_LABEL[lane].toUpperCase()}</text>
              <line x1={left} y1={top + (li + 1) * laneH} x2={width} y2={top + (li + 1) * laneH} stroke={p.divider} />
            </g>
          ))}
          {items.map((it) => {
            const li = LANES.indexOf(it.kind);
            const x = xFor(it.date);
            const key = `${li}-${x}`;
            const n = used.get(key) ?? 0;
            used.set(key, n + 1);
            const y = top + li * laneH + 14 + n * 14;
            const sel = it.id === selectedId;
            const late = it.date < DAYS[0]! || it.date > DAYS[DAYS.length - 1]!;
            const carried = it.group === 'Items carried forward';
            const c = colour(it);
            return (
              <g key={it.id} onClick={() => onSelect(it)} style={{ cursor: 'pointer' }} tabIndex={0} role="button" aria-pressed={sel} aria-label={`${it.projectName}: ${it.title}`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(it); } }}>
                <circle cx={x} cy={y} r={sel ? 7 : 5} fill={carried ? p.background.paper : c} stroke={sel ? p.brand.accent : carried ? c : p.background.paper} strokeWidth={sel || carried ? 2 : 1} />
                {late ? <text x={x + 9} y={y + 4} fontSize={10} fill={p.text.secondary}>{it.date < DAYS[0]! ? 'earlier' : 'next'}</text> : null}
                <title>{it.projectName}: {it.title} ({it.current})</title>
              </g>
            );
          })}
        </svg>
      </Box>
      <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', mt: 1.5 }}>
        {KEY.map((k) => (
          <Stack key={k.text} direction="row" sx={{ gap: 0.75, alignItems: 'center' }}>
            <Box aria-hidden sx={{ width: 10, height: 10, borderRadius: '50%', ...(k.hollow ? { border: 2, borderColor: 'text.secondary' } : { bgcolor: k.colour }) }} />
            <Typography variant="label" sx={{ color: 'text.secondary' }}>{k.text}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
