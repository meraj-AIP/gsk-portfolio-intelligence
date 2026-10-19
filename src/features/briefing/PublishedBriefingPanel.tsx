import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/features/auth/AuthContext';
import { useDefinitions, useReviseBriefing } from '@/shared/api/hooks';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { can } from '@/shared/lib/permissions';
import type { Briefing } from '@/shared/types/domain';

type Props = { briefing: Briefing; onRevised: (b: Briefing) => void };

/** Who published the frozen content, when, and under which definition versions. Changes go into a revision. */
export function PublishedBriefingPanel({ briefing, onRevised }: Props) {
  const { user } = useAuth();
  const defs = useDefinitions();
  const revise = useReviseBriefing();
  const pub = briefing.published;
  const versions = Object.entries(pub?.definitionVersions ?? {});
  const name = (id: string) => defs.data?.find((d) => d.id === id)?.name ?? id;
  const allowed = can(user, 'prepare briefing');

  return (
    <Stack sx={{ gap: 1.25 }}>
      <Alert severity="info">This briefing is {briefing.status} and read-only. Corrections go into a revision; this version stays as it was.</Alert>
      <KeyValueList items={[
        { label: 'Published by', value: pub?.publishedBy ?? 'Not recorded' },
        { label: 'Published at', value: pub?.publishedAt ?? 'Not recorded' },
        { label: 'Version', value: String(briefing.version) },
        { label: 'Snapshot', value: briefing.snapshotId },
      ]} />
      <div>
        <Typography variant="overline" component="p" sx={{ mb: 0.5 }}>Definition versions in force</Typography>
        {versions.length === 0 ? <Typography variant="body2">Not recorded for this publication.</Typography> : (
          <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
            {versions.map(([id, v]) => <StatusChip key={id} tone="info" square dot={false} title={id}>{name(id)}: v{v}</StatusChip>)}
          </Stack>
        )}
      </div>
      {briefing.status === 'published' ? (
        <Stack sx={{ gap: 0.5 }}>
          <Button variant="outlined" disabled={!allowed || revise.isPending} onClick={() => void revise.mutateAsync(briefing.id).then(onRevised).catch(() => undefined)}>Start revision</Button>
          {!allowed ? <Typography variant="caption">Only the portfolio lead can start a revision.</Typography> : null}
        </Stack>
      ) : null}
      {revise.isError ? <Alert severity="error">{revise.error.message}</Alert> : null}
    </Stack>
  );
}
