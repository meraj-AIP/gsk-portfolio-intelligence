import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { EvidenceInline } from '@/features/evidence/EvidenceInline';
import { EntityLink } from '@/shared/components/EntityLink';
import { formatDate } from '@/shared/lib/format';
import type { Impact, ImpactRow } from '@/shared/lib/journey';
import type { Evidence } from '@/shared/types/domain';
import { Step, muted } from './JourneyParts';
import { StatementFrame } from '@/shared/components/ui/Statement';

function Row({ r, evidence }: { r: ImpactRow; evidence: Evidence[] }) {
  return (
    <Stack sx={{ gap: 0.5, py: 1, borderTop: 1, borderColor: 'divider' }}>
      <Typography variant="body2">
        <EntityLink id={r.programmeId} label={r.programmeName} /> &gt; <EntityLink id={r.projectId} label={r.projectName} />, owner {r.owner}
      </Typography>
      <Typography variant="body2">{r.note}</Typography>
      {r.commitments.map((c) => (
        <Typography key={c.id} variant="body2" sx={muted}>
          {c.title}: now {formatDate(c.currentDate)}, baseline {formatDate(c.baselineDate)}{c.actualDate ? `, delivered ${formatDate(c.actualDate)}` : ''}
        </Typography>
      ))}
      {r.evidenceId ? <EvidenceInline id={r.evidenceId} record={evidence.find((e) => e.id === r.evidenceId)} compact /> : null}
    </Stack>
  );
}

function Group({ rows, evidence, empty }: { rows: ImpactRow[]; evidence: Evidence[]; empty: string }) {
  if (!rows.length) return <Typography variant="body2" sx={muted}>{empty}</Typography>;
  return <Box>{rows.map((r) => <Row key={`${r.projectId}-${r.note}`} r={r} evidence={evidence} />)}</Box>;
}

/** Confirmed and inferred are kept in separate frames so a dependency's possible exposure never reads as a reported delay. */
export function StepImpact({ impact, evidence }: { impact: Impact; evidence: Evidence[] }) {
  const total = impact.confirmed.length + impact.inferred.length;
  const lead = total
    ? `${impact.confirmed.length} confirmed and ${impact.inferred.length} inferred, by programme and project.`
    : 'No programme or project is linked to this finding yet.';
  return (
    <Step n={2} title="What it affects" lead={lead}>
      <StatementFrame type="reported fact" label="Confirmed impact, from reported records and calculations">
        <Group rows={impact.confirmed} evidence={evidence} empty="Nothing confirmed yet." />
      </StatementFrame>
      <StatementFrame type="AI interpretation" label="Inferred exposure, AI interpretation not confirmed by an owner">
        <Group rows={impact.inferred} evidence={evidence} empty="No inferred exposure beyond the confirmed impact." />
      </StatementFrame>
    </Step>
  );
}
