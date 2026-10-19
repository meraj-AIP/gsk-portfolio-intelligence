import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { Commitment } from '@/shared/types/domain';
import { EmptyState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { SegmentedToggle } from '@/shared/components/ui/Controls';
import { CommitmentTable } from './CommitmentTable';

const START = new Date('2026-09-07').getTime();
const END = new Date('2026-11-15').getTime();
const TICKS = ['2026-09-07', '2026-09-21', '2026-10-05', '2026-10-19', '2026-11-02'];

/** Original plan, revisions and actual results stay distinguishable: hollow marker for baseline, bar for the move, filled marker for actual. */
export function CommitmentTimeline({ commitments }: { commitments: Commitment[] }) {
  const theme = useTheme();
  const [view, setView] = useUrlParam('timeline');
  if (!commitments.length) return <EmptyState title="No commitments recorded" />;
  const toggle = (
    <Box sx={{ mb: 1.5 }}>
      <SegmentedToggle label="Timeline view" value={view || 'chart'} onChange={(v) => setView(v === 'chart' ? null : v)} options={[{ value: 'chart', label: 'Chart' }, { value: 'table', label: 'Table' }]} />
    </Box>
  );
  if (view === 'table') return <Box>{toggle}<CommitmentTable commitments={commitments} /></Box>;
  const left = 230; const width = 900; const rowH = 30; const top = 26;
  const x = (d: string) => left + ((new Date(d).getTime() - START) / (END - START)) * (width - left - 16);
  const height = top + commitments.length * rowH + 8;
  const colour = (c: Commitment) => c.status === 'late' ? theme.palette.condition.breached : c.status === 'revised' || c.status === 'carried forward' ? theme.palette.condition.attention : theme.palette.text.secondary;
  return (
    <Box sx={{ overflowX: 'auto' }}>
      {toggle}
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Commitment timeline with baseline, current and actual dates" style={{ minWidth: 760, width: '100%', fontFamily: theme.typography.fontFamily }}>
        {TICKS.map((t) => <g key={t}><line x1={x(t)} y1={top - 6} x2={x(t)} y2={height} stroke={theme.palette.divider} /><text x={x(t) + 3} y={top - 10} fontSize={10.5} fill={theme.palette.text.secondary}>{t.slice(5)}</text></g>)}
        <line x1={x('2026-10-12')} y1={top - 6} x2={x('2026-10-12')} y2={height} stroke={theme.palette.primary.main} strokeDasharray="4 3" />
        {commitments.map((c, i) => {
          const y = top + i * rowH + rowH / 2; const col = colour(c);
          return (
            <g key={c.id}>
              <text x={6} y={y + 4} fontSize={11.5} fill={theme.palette.text.primary}>{c.title.length > 36 ? `${c.title.slice(0, 35)}…` : c.title}</text>
              {c.baselineDate !== c.currentDate ? <line x1={x(c.baselineDate)} y1={y} x2={x(c.currentDate)} y2={y} stroke={col} strokeWidth={3} strokeOpacity={0.5} /> : null}
              <circle cx={x(c.baselineDate)} cy={y} r={5} fill={theme.palette.background.paper} stroke={col} strokeWidth={1.8}><title>Baseline {c.baselineDate}</title></circle>
              {c.baselineDate !== c.currentDate ? <rect x={x(c.currentDate) - 4.5} y={y - 4.5} width={9} height={9} fill={theme.palette.background.paper} stroke={col} strokeWidth={1.8}><title>Current {c.currentDate}</title></rect> : null}
              {c.actualDate ? <circle cx={x(c.actualDate)} cy={y} r={5.5} fill={col}><title>Actual {c.actualDate}</title></circle> : null}
            </g>
          );
        })}
      </svg>
      <Typography variant="caption">Hollow circle: original plan. Square: current commitment. Filled circle: actual result. Dashed line: reporting date.</Typography>
    </Box>
  );
}
