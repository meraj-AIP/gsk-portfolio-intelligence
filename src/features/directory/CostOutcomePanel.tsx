import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { CostRecord, FundingShare, OutcomeMeasure } from '@/shared/types/domain';
import { gbp, gbpShort } from '@/shared/lib/format';
import { costSummary } from '@/shared/lib/portfolio';
import { CostRecordsTable } from './CostRecordsTable';
import { OutcomeGroups } from './OutcomeGroups';

type Props = { projectIds: string[]; costs: CostRecord[]; outcomes: OutcomeMeasure[]; funding: FundingShare[]; attributionNote?: string };

/** Budget, actual and forecast as bars; outcomes by kind, never summed; funding split by business unit; Finance sign-off per record. */
export function CostOutcomePanel({ projectIds, costs, outcomes, funding, attributionNote }: Props) {
  const c = costSummary(costs, projectIds);
  const max = Math.max(c.budget, c.forecast, c.actual, 1);
  // Only an overspend earns colour; budget, actual and an on-budget forecast stay neutral.
  const bars = [{ label: 'Budget', value: c.budget, colour: 'text.disabled' }, { label: 'Actual to date', value: c.actual, colour: 'primary.main' }, { label: 'Forecast', value: c.forecast, colour: c.variance / (c.budget || 1) > 0.15 ? 'condition.breached' : c.variance > 0 ? 'condition.attention' : 'text.secondary' }];
  const inScope = outcomes.filter((o) => projectIds.includes(o.projectId));
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Typography variant="overline" component="h3">Cost, FY26 year to date, GBP</Typography>
        <Stack sx={{ gap: 0.75, mt: 1 }}>
          {bars.map((b) => (
            <Box key={b.label}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}><Typography variant="caption">{b.label}</Typography><Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'primary.main' }}>{gbp(b.value)}</Typography></Stack>
              <Box sx={(t) => ({ mt: 0.5, height: 6, borderRadius: 9999, bgcolor: t.palette.tint.neutral.bg, overflow: 'hidden' })}><Box sx={{ height: '100%', borderRadius: 9999, width: `${(b.value / max) * 100}%`, bgcolor: b.colour }} /></Box>
            </Box>
          ))}
        </Stack>
        <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>Calculated from direct records: variance {c.variance >= 0 ? '+' : ''}{gbp(c.variance)} ({Math.round((c.variance / (c.budget || 1)) * 100)} percent). Coverage {c.coverage} of {c.of} projects.{c.sharedExcluded ? ` ${gbpShort(c.sharedExcluded)} shared allocation excluded until Finance confirms the basis (DEF-06).` : ''}</Typography>
        <Typography variant="overline" component="h3" sx={{ display: 'block', mt: 2.5 }}>Who is funding this</Typography>
        <Stack direction="row" sx={{ mt: 0.75, height: 8, borderRadius: 9999, overflow: 'hidden' }}>{funding.map((f, i) => <Box key={f.businessUnit} title={`${f.businessUnit} ${f.percent}%`} sx={{ width: `${f.percent}%`, bgcolor: 'primary.main', opacity: 0.9 - i * 0.25, borderRight: 1, borderColor: 'background.paper' }} />)}</Stack>
        <Typography variant="caption">{funding.map((f) => `${f.businessUnit} ${f.percent}%`).join('; ')}</Typography>
        {attributionNote ? <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>{attributionNote}</Typography> : null}
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Typography variant="overline" component="h3">Outcomes by kind (kept separate, never summed)</Typography>
        <OutcomeGroups measures={inScope} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="overline" component="h3" sx={{ display: 'block', mb: 1 }}>Reported cost records and Finance sign-off</Typography>
        <CostRecordsTable records={costs.filter((r) => projectIds.includes(r.projectId))} />
      </Grid>
    </Grid>
  );
}
