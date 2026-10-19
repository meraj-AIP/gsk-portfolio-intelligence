import Link from '@mui/material/Link';
import type { ProgrammeRow } from '@/shared/api/listApi';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { InitiativeCard } from '@/shared/components/ui/InitiativeCard';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { CONDITION_SHORT, formatDate } from '@/shared/lib/format';
import type { Project } from '@/shared/types/domain';
import { worstAcross } from './directoryModel';

const FRESHNESS: Record<ProgrammeRow['freshness'], { text: string; tone: 'neutral' | 'warning' | 'danger' }> = {
  current: { text: 'All current', tone: 'neutral' },
  stale: { text: 'One or more stale', tone: 'warning' },
  missing: { text: 'Update missing', tone: 'danger' },
};

type Props = { row: ProgrammeRow; projects: Project[]; findingTitle?: string | undefined; onOpenFinding: (id: string) => void };

/** Programme variant of the initiative tile: business area leads, the status is the worst position among its projects. */
export function ProgrammeCard({ row, projects, findingTitle, onOpenFinding }: Props) {
  const fresh = FRESHNESS[row.freshness];
  const highlight = row.materialFindingId
    ? { label: 'Material finding', text: <Link component="button" type="button" variant="body2" sx={{ fontWeight: 600, textAlign: 'left' }} onClick={() => onOpenFinding(row.materialFindingId!)}>{findingTitle ?? row.materialFindingId}</Link> }
    : undefined;
  return (
    <InitiativeCard
      tag={row.businessArea}
      leadTag
      status={projects.length ? <ConditionChip condition={worstAcross(projects)} label={`Worst: ${CONDITION_SHORT[worstAcross(projects)]}`} /> : <StatusChip tone="neutral">No projects</StatusChip>}
      title={row.name}
      description={row.objective}
      facts={[
        { label: 'Sponsor', value: row.sponsor },
        { label: 'Projects', value: row.projectCount },
        { label: 'Key commitment', value: row.keyCommitment ? `${row.keyCommitment.title}, due ${formatDate(row.keyCommitment.currentDate)}` : 'None open' },
        { label: 'Freshness', value: <StatusChip tone={fresh.tone} dot={false}>{fresh.text}</StatusChip> },
      ]}
      {...(highlight ? { highlight } : {})}
      owner={{ name: row.lead, role: 'Programme lead' }}
      to={`/programmes/${row.id}`}
    />
  );
}
