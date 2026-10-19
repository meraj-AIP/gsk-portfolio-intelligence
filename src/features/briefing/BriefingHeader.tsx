import Typography from '@mui/material/Typography';
import { FilterChips } from '@/shared/components/ui/Controls';
import { StatusChip, type Tone } from '@/shared/components/ui/StatusChip';
import type { Briefing, BriefingStatus } from '@/shared/types/domain';

const STATUS_TONE: Record<BriefingStatus, Tone> = { draft: 'neutral', 'under review': 'warning', approved: 'info', published: 'success', superseded: 'neutral' };

const capitalise = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

/** Status, version and snapshot of the open briefing, straight from its record. */
export function BriefingEyebrow({ b }: { b: Briefing }) {
  return (
    <>
      <StatusChip tone={STATUS_TONE[b.status]}>{capitalise(b.status)}</StatusChip>
      <StatusChip tone="neutral" dot={false}>Version {b.version}</StatusChip>
      <StatusChip tone="info" square dot={false}>Snapshot {b.snapshotId}</StatusChip>
      <Typography variant="overline">Revision {b.revision}, updated {b.updatedAt}</Typography>
    </>
  );
}

/** Every briefing on record, so another period or audience is one click away. */
export function BriefingPicker({ all, current, onOpen }: { all: Briefing[]; current: string; onOpen: (b: Briefing) => void }) {
  return (
    <FilterChips label="Briefings" value={current} onChange={(id) => { const b = all.find((x) => x.id === id); if (b) onOpen(b); }}
      options={all.map((b) => ({ value: b.id, label: `${b.period}, ${b.audience}: ${b.status} v${b.version}` }))} />
  );
}
