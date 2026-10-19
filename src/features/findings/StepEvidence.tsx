import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { EvidenceInline } from '@/features/evidence/EvidenceInline';
import { EntityLink } from '@/shared/components/EntityLink';
import type { Evidence, Finding } from '@/shared/types/domain';
import { Field, Step, StatementFrame, muted } from './JourneyParts';

function Calculation({ f }: { f: Finding }) {
  if (f.statementType !== 'calculated result') return null;
  if (!f.calculation) return <Typography variant="body2" sx={{ fontWeight: 600 }}>The method was not recorded with this result. Treat it as unverified until the owner confirms how it was produced.</Typography>;
  return (
    <Stack sx={{ gap: 0.75 }}>
      <Field label="Method">{f.calculation.method}</Field>
      <Field label="Inputs">
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>{f.calculation.inputs.map((i) => <EntityLink key={i} id={i} />)}</Stack>
      </Field>
    </Stack>
  );
}

/** The statement and the records behind it sit in one frame, so the reader never has to cross-reference a list. */
export function StepEvidence({ f, evidence }: { f: Finding; evidence: Evidence[] }) {
  const n = f.evidenceIds.length;
  const lead = n ? `${n} record${n === 1 ? '' : 's'} support${n === 1 ? 's' : ''} the current position.` : 'No evidence record supports this finding yet. Treat it as unverified.';
  return (
    <Step n={4} title="Evidence" lead={lead}>
      <StatementFrame type={f.statementType}>
        <Stack sx={{ gap: 1.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{f.currentPosition}</Typography>
          <Calculation f={f} />
          {n ? (
            <Stack sx={{ gap: 1 }}>
              <Typography variant="caption">Supported by</Typography>
              {f.evidenceIds.map((id) => <EvidenceInline key={id} id={id} record={evidence.find((e) => e.id === id)} />)}
            </Stack>
          ) : <Typography variant="body2" sx={muted}>No supporting record.</Typography>}
        </Stack>
      </StatementFrame>
      <Typography variant="caption">A source-supported statement is still a reported statement. Its presence in a record does not mean every underlying claim has been verified.</Typography>
    </Step>
  );
}
