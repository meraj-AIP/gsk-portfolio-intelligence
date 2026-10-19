import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { Freshness } from '@/shared/components/Freshness';
import { InitiativeCard } from '@/shared/components/ui/InitiativeCard';
import { formatDate } from '@/shared/lib/format';
import type { Finding, Project } from '@/shared/types/domain';
import { gateSummary, riskLabel, worstOf } from './directoryModel';

type Props = { project: Project; programmeName: string; finding?: Finding | undefined; selected?: boolean; onToggle?: (id: string) => void };

/** A project as a reference initiative tile. Every fact is a field on the project record or a count of its gates. */
export function ProjectCard({ project: p, programmeName, finding, selected, onToggle }: Props) {
  const gates = gateSummary(p.gates);
  const status = (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25 }}>
      <ConditionChip condition={worstOf(p.position).condition} label={riskLabel(p)} />
      {onToggle ? <Checkbox size="small" checked={Boolean(selected)} onChange={() => onToggle(p.id)} slotProps={{ input: { 'aria-label': `Select ${p.name} for comparison` } }} sx={{ p: 0.5 }} /> : null}
    </Stack>
  );
  const highlight = p.outstandingResponse
    ? { label: 'Outstanding response', text: p.outstandingResponse }
    : finding ? { label: 'Material finding', text: finding.title } : undefined;
  return (
    <InitiativeCard
      tag={programmeName}
      status={status}
      title={p.name}
      description={p.purpose}
      facts={[
        { label: 'Stage', value: p.stage },
        { label: 'Commitment', value: p.commitment.actual ? `Done ${formatDate(p.commitment.actual)}` : `Due ${formatDate(p.commitment.current)}` },
        { label: 'Governance', value: `${gates.passed} of ${gates.total} gates passed` },
        { label: 'Reporting', value: <Freshness reportingDate={p.reportingDate} freshness={p.freshness} /> },
      ]}
      {...(highlight ? { highlight } : {})}
      owner={{ name: p.owner, role: `Project owner, ${p.id}` }}
      to={`/projects/${p.id}`}
    />
  );
}
