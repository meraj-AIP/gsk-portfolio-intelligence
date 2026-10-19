import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useRef } from 'react';
import { ConditionChip } from '@/shared/components/ConditionChip';
import type { TraceRow } from '@/shared/lib/constraints';
import { formatDate } from '@/shared/lib/format';
import { ConstraintEvidence } from '@/shared/components/ConstraintEvidence';
import { commitmentMove } from './ConstraintModel';

type BasisProps = { label: string; basis: string; text: string; inferred?: boolean };

/** The border style carries the basis, matching the finding journey: solid for recorded statements, dotted for AI inference. */
function Basis({ label, basis, text, inferred = false }: BasisProps) {
  return (
    <Box sx={{ height: '100%', p: 1, border: 1, borderStyle: inferred ? 'dotted' : 'solid', borderColor: inferred ? 'text.secondary' : 'divider', borderRadius: 0.5 }}>
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>{label}</Typography>
      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>{basis}</Typography>
      <Typography variant="body2" sx={{ fontStyle: inferred ? 'italic' : 'normal' }}>{text || 'Nothing recorded'}</Typography>
    </Box>
  );
}

/** One dependency on the constraint: what it is, which commitments ride on it, the three kinds of impact, and its evidence. */
export function ConstraintTraceItem({ row, focused = false }: { row: TraceRow; focused?: boolean }) {
  const d = row.dependency;
  const ref = useRef<HTMLDivElement>(null);
  // A linked dependency may sit far down a long trace, so bring it into view once when it arrives focused.
  useEffect(() => { if (focused) ref.current?.scrollIntoView({ block: 'center' }); }, [focused]);
  const exception = d.position === 'breached' || d.position === 'attention';
  return (
    <Stack ref={ref} aria-current={focused ? 'true' : undefined} sx={{ gap: 1, pl: 1.5, borderLeft: focused ? 4 : 2, borderColor: focused ? 'primary.main' : 'divider', bgcolor: focused ? 'background.default' : 'transparent', py: focused ? 1 : 0 }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        {exception ? <ConditionChip condition={d.position} compact /> : null}
        <Typography variant="body2">{d.description}</Typography>
      </Stack>
      <Typography variant="caption">{d.id}, {d.type}. Dependency owner {d.owner}, required by {formatDate(d.requiredDate)}.</Typography>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>Commitments</Typography>
        {row.commitments.length === 0 ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>None recorded against this dependency.</Typography> : (
          <Stack component="ul" sx={{ m: 0, pl: 2.5 }}>
            {row.commitments.map((c) => (
              <Typography key={c.id} component="li" variant="body2">
                {c.title} ({c.owner}): now {formatDate(c.currentDate)}, baseline {formatDate(c.baselineDate)}, {commitmentMove(c)}.
              </Typography>
            ))}
          </Stack>
        )}
      </Box>
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 4 }}><Basis label="Confirmed impact" basis="Recorded effect" text={row.confirmedImpact} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><Basis label="Owner reported" basis={`Statement by ${d.owner}`} text={row.ownerReported} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><Basis label="Inferred exposure" basis="AI inferred, not a reported fact" text={row.inferredExposure} inferred /></Grid>
      </Grid>
      <ConstraintEvidence id={d.evidenceId} />
    </Stack>
  );
}
