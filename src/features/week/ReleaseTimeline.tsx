import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { KeyboardEvent } from 'react';
import type { Programme, Project, Release, ReleaseEvent } from '@/shared/types/domain';
import { EVENT_LABEL } from './ReleaseTable';
import { addDays, shortDate } from './weekModel';

type Props = { releases: Release[]; projects: Project[]; programmes: Programme[]; reportingDate: string; selectedId: string | null; onSelect: (id: string) => void };

const SHAPE: Record<ReleaseEvent['kind'], 'hollow' | 'filled' | 'square' | 'triangle' | 'cross'> = { planned: 'hollow', deployed: 'square', available: 'filled', expanded: 'triangle', withdrawn: 'cross' };
const DAY = 86_400_000;
const time = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

function Marker({ x, y, kind, colour, paper }: { x: number; y: number; kind: ReleaseEvent['kind']; colour: string; paper: string }) {
  const s = SHAPE[kind];
  if (s === 'hollow') return <circle cx={x} cy={y} r={5} fill={paper} stroke={colour} strokeWidth={1.8} />;
  if (s === 'filled') return <circle cx={x} cy={y} r={5.5} fill={colour} />;
  if (s === 'square') return <rect x={x - 4.5} y={y - 4.5} width={9} height={9} fill={paper} stroke={colour} strokeWidth={1.8} />;
  if (s === 'triangle') return <polygon points={`${x},${y - 6} ${x + 6},${y + 5} ${x - 6},${y + 5}`} fill={colour} />;
  return <g stroke={colour} strokeWidth={2}><line x1={x - 5} y1={y - 5} x2={x + 5} y2={y + 5} /><line x1={x - 5} y1={y + 5} x2={x + 5} y2={y - 5} /></g>;
}

/** Weekly gridlines from the Monday before the earliest event to the week after the latest, so new data never falls off the chart. */
function weekRange(releases: Release[], reportingDate: string): string[] {
  const all = [...releases.flatMap((r) => r.events.map((e) => e.date)), reportingDate].filter(Boolean).sort();
  const first = all[0]!;
  const start = addDays(first, -((new Date(time(first)).getUTCDay() + 6) % 7));
  const weeks = Math.max(4, Math.ceil((time(all[all.length - 1]!) - time(start)) / (7 * DAY)) + 1);
  return Array.from({ length: weeks }, (_, i) => addDays(start, i * 7));
}

/** The table view in ReleasesView lists the same dates. Timeline markers keep planned, deployed, available, expanded and withdrawn distinct. Deployment alone is not availability. */
export function ReleaseTimeline({ releases, projects, programmes, reportingDate, selectedId, onSelect }: Props) {
  const theme = useTheme();
  const paper = theme.palette.background.paper;
  const rows = programmes.flatMap((pg) => releases.filter((r) => projects.find((p) => p.id === r.projectId)?.programmeId === pg.id).map((r) => ({ r, pg })));
  const weeks = weekRange(releases, reportingDate);
  const left = 250; const width = 980; const rowH = 30; const top = 28;
  const span = time(addDays(weeks[weeks.length - 1]!, 7)) - time(weeks[0]!);
  const xFor = (d: string) => left + ((time(d) - time(weeks[0]!)) / span) * (width - left - 20);
  const height = top + rows.length * rowH + 16;
  // Colour marks exceptions only: amber when the plan moved or availability came after the first plan, neutral otherwise.
  const colour = (r: Release) => {
    const planned = r.events.filter((e) => e.kind === 'planned').map((e) => e.date).sort();
    const available = r.events.find((e) => e.kind === 'available');
    const late = Boolean(planned[0] && available && available.date > planned[0]);
    return !r.events.some((e) => e.kind === 'withdrawn') && (planned.length > 1 || late) ? theme.palette.condition.attention : theme.palette.text.secondary;
  };
  const select = (e: KeyboardEvent, id: string) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(id); } };
  let lastPg = '';
  return (
    <Box>
        <Box sx={{ overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Release timeline grouped by programme. The table view lists the same dates. Tab to a release and press Enter to open it." style={{ minWidth: 820, width: '100%', fontFamily: theme.typography.fontFamily }}>
            {weeks.map((w) => <g key={w}><line x1={xFor(w)} y1={top - 8} x2={xFor(w)} y2={height} stroke={theme.palette.divider} /><text x={xFor(w) + 3} y={top - 12} fontSize={10.5} fill={theme.palette.text.secondary}>{shortDate(w)}</text></g>)}
            {reportingDate ? <line x1={xFor(reportingDate)} y1={top - 8} x2={xFor(reportingDate)} y2={height} stroke={theme.palette.primary.main} strokeDasharray="4 3" /> : null}
            {rows.map(({ r, pg }, i) => {
              const y = top + i * rowH + rowH / 2;
              const header = pg.id !== lastPg; lastPg = pg.id;
              const planned = r.events.filter((e) => e.kind === 'planned');
              const avail = r.events.find((e) => e.kind === 'available');
              const sel = r.id === selectedId;
              const c = colour(r);
              return (
                <g key={r.id} onClick={() => onSelect(r.id)} style={{ cursor: 'pointer' }} role="button" tabIndex={0} aria-pressed={sel} aria-label={r.capability} onKeyDown={(e) => select(e, r.id)}>
                  {sel ? <rect x={0} y={y - rowH / 2} width={width} height={rowH} fill={theme.palette.background.default} /> : null}
                  {header ? <text x={6} y={y - 9} fontSize={9.5} fontWeight={700} fill={theme.palette.text.secondary}>{pg.name.toUpperCase()}</text> : null}
                  <text x={6} y={y + 4} fontSize={11.5} fill={theme.palette.text.primary} fontWeight={sel ? 700 : 400}>{r.capability.length > 40 ? `${r.capability.slice(0, 39)}...` : r.capability}</text>
                  {planned.length > 1 ? <line x1={xFor(planned[0]!.date)} y1={y} x2={xFor(planned[planned.length - 1]!.date)} y2={y} stroke={c} strokeWidth={2} strokeDasharray="3 3" /> : null}
                  {planned[0] && avail ? <line x1={xFor(planned[0].date)} y1={y} x2={xFor(avail.date)} y2={y} stroke={c} strokeWidth={2} /> : null}
                  {r.events.map((e, j) => <g key={j}><Marker x={xFor(e.date)} y={y} kind={e.kind} colour={c} paper={paper} /><title>{EVENT_LABEL[e.kind]}: {e.date}. {e.note}</title></g>)}
                </g>
              );
            })}
          </svg>
        </Box>
        <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', mt: 1 }}>
          {(Object.keys(SHAPE) as ReleaseEvent['kind'][]).map((k) => (
            <Stack key={k} direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
              <svg width={16} height={16} aria-hidden="true"><Marker x={8} y={8} kind={k} colour={theme.palette.text.secondary} paper={paper} /></svg>
              <Typography variant="caption">{EVENT_LABEL[k]}</Typography>
            </Stack>
          ))}
          <Typography variant="caption">Amber: planned date moved or availability came after the first plan. Dashed line: planned date moved. Vertical dashed line: reporting date.</Typography>
        </Stack>
    </Box>
  );
}
