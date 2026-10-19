import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatDate, gbpShort } from '@/shared/lib/format';
import type { Implication } from '@/shared/lib/journey';
import type { Finding } from '@/shared/types/domain';
import { Field, Step, muted } from './JourneyParts';
import { StatementFrame } from '@/shared/components/ui/Statement';

function Cost({ cost }: { cost: Implication['cost'] }) {
  if (!cost.budget) return <Typography variant="body2" sx={muted}>No direct budget is recorded against the affected projects.</Typography>;
  return (
    <Typography variant="body2">
      {gbpShort(cost.budget)} direct budget, {gbpShort(cost.forecast)} forecast ({cost.variance >= 0 ? `${gbpShort(cost.variance)} over` : `${gbpShort(-cost.variance)} under`}).
      {' '}Covers {cost.coverage} of {cost.of} affected projects.{cost.sharedExcluded ? ` ${gbpShort(cost.sharedExcluded)} of shared cost is excluded until an allocation basis exists.` : ''}
    </Typography>
  );
}

/** Significance is the finding's own statement; everything after it is derived from linked records and labelled as calculated. */
export function StepImplication({ f, implication }: { f: Finding; implication: Implication }) {
  const { commitmentsAtRisk, forecastOutcomes, measuredOutcomes } = implication;
  return (
    <Step n={3} title="Why it matters" lead={f.significance}>
      <StatementFrame type="calculated result" label="Calculated from linked commitments, outcomes and cost records">
        <Stack sx={{ gap: 1.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{implication.summary}</Typography>
          <Field label={`Commitments at risk (${commitmentsAtRisk.length})`}>
            {commitmentsAtRisk.length ? commitmentsAtRisk.map((c) => (
              <Typography key={c.id} variant="body2">{c.title}, {c.owner}: now {formatDate(c.currentDate)}, baseline {formatDate(c.baselineDate)}</Typography>
            )) : <Typography variant="body2" sx={muted}>None open.</Typography>}
          </Field>
          <Field label="Benefits">
            <Typography variant="body2">{forecastOutcomes.length} still forecast, {measuredOutcomes.length} measured.</Typography>
            {forecastOutcomes.map((o) => <Typography key={o.id} variant="body2" sx={muted}>Forecast: {o.name}, {o.forecast}</Typography>)}
            {measuredOutcomes.map((o) => <Typography key={o.id} variant="body2" sx={muted}>Measured: {o.name}, {o.actual}</Typography>)}
          </Field>
          <Field label="Direct budget exposed"><Cost cost={implication.cost} /></Field>
        </Stack>
      </StatementFrame>
      {f.unknowns ? <Field label="Unknowns or contradictory information">{f.unknowns}</Field> : null}
    </Step>
  );
}
