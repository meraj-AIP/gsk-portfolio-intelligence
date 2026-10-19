import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { formatDate } from '@/shared/lib/format';

type Props = { reportingDate: string; freshness: 'current' | 'stale' | 'missing'; cadence?: string };

export function Freshness({ reportingDate, freshness, cadence = 'Weekly, Friday' }: Props) {
  const colour = freshness === 'current' ? 'text.secondary' : freshness === 'stale' ? 'condition.attention' : 'condition.breached';
  const text = freshness === 'current' ? `Updated ${formatDate(reportingDate)}` : freshness === 'stale' ? `Stale, last ${formatDate(reportingDate)}` : 'No update received';
  return (
    <Tooltip title={`Expected cadence: ${cadence}. Affects delivery position, findings and programme totals.`}>
      <Typography variant="caption" sx={{ color: colour, fontWeight: freshness === 'current' ? 400 : 700 }}>{text}</Typography>
    </Tooltip>
  );
}
