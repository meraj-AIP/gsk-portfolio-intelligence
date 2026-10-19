import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Dependency, GraphNode } from '@/shared/types/domain';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { ConstraintEvidence } from '@/shared/components/ConstraintEvidence';
import { EntityLink } from '@/shared/components/EntityLink';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { DomainTag, StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import { ConstraintImpact } from './ConstraintImpact';

/** The selected relationship in the same card language as the trace: tags, owner, the three impact blocks and inline evidence. */
export function DependencySidePanel({ dependency: d, nodes }: { dependency: Dependency; nodes: GraphNode[] }) {
  const label = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;
  return (
    <Stack sx={{ gap: 1.5 }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <ConditionChip condition={d.position} />
        <DomainTag>{d.type}</DomainTag>
        {d.reuseCandidate ? <StatusChip tone="info" dot={false}>Reuse candidate: owner assessment needed</StatusChip> : null}
      </Stack>
      <Box>
        <Typography variant="overline" component="p">{d.id}</Typography>
        <Typography variant="body2"><EntityLink id={d.fromId} label={label(d.fromId)} /> {d.type} <strong>{label(d.toId)}</strong></Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{d.description}</Typography>
      </Box>
      <Stack direction="row" sx={{ gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <AvatarName name={d.owner} subtitle="Dependency owner" size={24} />
        <Box>
          <Typography variant="overline" component="p">Required</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatDate(d.requiredDate)}</Typography>
        </Box>
      </Stack>
      <ConstraintImpact confirmed={d.actualImpact} ownerReported={d.ownerReportedImpact} inferred={d.aiInferredExposure} owner={d.owner} stacked />
      <Box>
        <Typography variant="overline" component="p">Affected commitments ({d.affectedCommitmentIds.length})</Typography>
        <Typography variant="body2">{d.affectedCommitmentIds.length ? d.affectedCommitmentIds.join(', ') : 'None recorded'}</Typography>
      </Box>
      <Box>
        <Typography variant="overline" component="p" sx={{ mb: 0.5 }}>Evidence</Typography>
        <ConstraintEvidence id={d.evidenceId} />
      </Box>
    </Stack>
  );
}
