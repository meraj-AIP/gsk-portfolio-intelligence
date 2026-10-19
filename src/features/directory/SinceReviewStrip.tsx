import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { useReview } from '@/app/context/ReviewContext';
import { weekLabel } from '@/app/context/weekLabel';
import { useSinceReview } from '@/shared/api/hooks';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import type { Finding } from '@/shared/types/domain';

type Props = { findings: Finding[]; projects: { id: string; name: string }[] };

/** What changed for this programme or project between the comparison review and the viewed review. */
export function SinceReviewStrip({ findings, projects }: Props) {
  const { scope, comparisonSnapshot, viewSnapshot } = useReview();
  const since = useSinceReview(scope.comparisonSnapshotId, scope.viewSnapshotId);
  const [, openFinding] = useUrlParam('finding');
  const wrap = (body: ReactNode, chips?: ReactNode) => (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="overline">Since last review</Typography>
        {chips}
      </Stack>
      {body}
    </Paper>
  );

  if (!comparisonSnapshot) return wrap(<Typography variant="body2" sx={{ color: 'text.secondary' }}>There is no earlier review to compare with.</Typography>);
  if (since.isError) return wrap(<ErrorState message="Changes since the last review could not be loaded." onRetry={() => void since.refetch()} />);
  if (!since.data) return wrap(since.isLoading ? <LoadingState rows={1} /> : <Typography variant="body2" sx={{ color: 'text.secondary' }}>No comparison is available for these reviews.</Typography>);

  const inScope = new Map(findings.map((f) => [f.id, f]));
  const pick = (ids: string[]) => ids.filter((id) => inScope.has(id));
  const added = pick(since.data.newFindingIds);
  const changed = pick(since.data.changedFindingIds);
  const resolved = pick(since.data.resolvedFindingIds);
  const persisting = since.data.persisting.filter((p) => inScope.has(p.id));
  const name = (id: string) => projects.find((p) => p.id === id)?.name ?? id;
  const ours = (m: { projectId: string }) => projects.some((p) => p.id === m.projectId);
  const moves = [...since.data.worsened.filter(ours).map((m) => ({ ...m, verb: 'worsened' })), ...since.data.improved.filter(ours).map((m) => ({ ...m, verb: 'improved' }))];
  const link = (id: string, suffix = '') => (
    <Link key={id} component="button" type="button" variant="body2" sx={{ textAlign: 'left' }} onClick={() => openFinding(id)}>{inScope.get(id)?.title ?? id}{suffix}</Link>
  );
  const groups = [
    { label: 'New', ids: added.map((id) => link(id)) },
    { label: 'Changed', ids: changed.map((id) => link(id)) },
    { label: 'Resolved', ids: resolved.map((id) => link(id)) },
    { label: 'Still open', ids: persisting.map((p) => link(p.id, `, ${p.weeks} week${p.weeks === 1 ? '' : 's'}`)) },
  ].filter((g) => g.ids.length);
  const range = `${weekLabel(comparisonSnapshot)} to ${weekLabel(viewSnapshot)}`;

  if (!groups.length && !moves.length) return wrap(<Typography variant="body2" sx={{ color: 'text.secondary' }}>Nothing changed between {range}.</Typography>);
  const chips = (
    <>
      <StatusChip tone="info" dot={false}>{added.length} new</StatusChip>
      <StatusChip tone="warning" dot={false}>{changed.length} changed</StatusChip>
      <StatusChip tone="success" dot={false}>{resolved.length} resolved</StatusChip>
      <StatusChip tone="neutral" dot={false}>{moves.length} position change{moves.length === 1 ? '' : 's'}</StatusChip>
    </>
  );
  return wrap(
    <Stack sx={{ gap: 0.75 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>From {range}.</Typography>
      {groups.map((g) => (
        <Stack key={g.label} direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'baseline' }}>
          <Typography variant="overline" sx={{ minWidth: 80 }}>{g.label}</Typography>
          {g.ids}
        </Stack>
      ))}
      {moves.map((m) => (
        <Typography key={`${m.projectId}-${m.dimension}`} variant="body2">{name(m.projectId)}: {m.dimension} {m.verb} from {m.from} to {m.to}.</Typography>
      ))}
    </Stack>,
    chips,
  );
}
