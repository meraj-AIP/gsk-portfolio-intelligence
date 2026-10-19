import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Dependency, GraphNode } from '@/shared/types/domain';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { EntityLink } from '@/shared/components/EntityLink';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { formatDate } from '@/shared/lib/format';
import { ConstraintEvidence } from '@/shared/components/ConstraintEvidence';

export function DependencySidePanel({ dependency: d, nodes }: { dependency: Dependency; nodes: GraphNode[] }) {
  const label = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;
  return (
    <Stack sx={{ gap: 1.25 }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        {d.position === 'breached' || d.position === 'attention' ? <ConditionChip condition={d.position} /> : <Chip label={`Position: ${d.position}`} variant="outlined" />}
        <Chip label={d.type} variant="outlined" />
        {d.reuseCandidate ? <Chip label="Reuse candidate: owner assessment needed" variant="outlined" /> : null}
      </Stack>
      <Typography variant="body2"><EntityLink id={d.fromId} label={label(d.fromId)} /> {d.type} <strong>{label(d.toId)}</strong></Typography>
      <Typography variant="body2">{d.description}</Typography>
      <KeyValueList items={[{ label: 'Owner', value: d.owner }, { label: 'Required date', value: formatDate(d.requiredDate) }]} />
      <KeyValueList columns={1} items={[
        { label: 'Confirmed impact', value: d.actualImpact },
        { label: 'Owner reported', value: d.ownerReportedImpact },
        { label: 'Inferred exposure (AI inferred, not a reported fact)', value: d.aiInferredExposure },
      ]} />
      <div>
        <Typography variant="caption">Affected commitments</Typography>
        <Typography variant="body2">{d.affectedCommitmentIds.length ? d.affectedCommitmentIds.join(', ') : 'None recorded'}</Typography>
      </div>
      <div>
        <Typography variant="caption">Evidence</Typography>
        <ConstraintEvidence id={d.evidenceId} />
      </div>
    </Stack>
  );
}
