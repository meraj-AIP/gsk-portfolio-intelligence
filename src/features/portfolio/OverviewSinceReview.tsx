import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useReview } from '@/app/context/ReviewContext';
import { weekLabel } from '@/app/context/weekLabel';
import { useFindings, useSinceReview } from '@/shared/api/hooks';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { StatusChip, type Tone } from '@/shared/components/ui/StatusChip';
import { CONDITION_SHORT } from '@/shared/lib/format';
import { findingsFor } from '@/shared/lib/portfolio';
import { DIM_CATEGORY, DIM_LABEL } from './matrixConfig';
import { usePanelHref } from './OverviewLinks';
import type { PortfolioView } from './usePortfolioView';

type Item = { key: string; text: string; to: string };
type Group = { title: string; items: Item[] };
const LIMIT = 5;

const TONE: Record<string, Tone> = {
  New: 'accent', Changed: 'info', Resolved: 'success', 'Still open': 'warning', 'Positions worsened': 'danger', 'Positions improved': 'success',
};

function GroupList({ group }: { group: Group }) {
  const [all, setAll] = useState(false);
  const shown = all ? group.items : group.items.slice(0, LIMIT);
  return (
    <Box sx={(t) => ({ p: 1.5, borderRadius: 1, bgcolor: t.palette.brand.canvas, border: `1px solid ${t.palette.divider}` })}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography variant="overline" component="h3">{group.title}</Typography>
        <StatusChip tone={TONE[group.title] ?? 'neutral'} dot={false}>{group.items.length}</StatusChip>
      </Stack>
      <Stack component="ul" sx={{ m: 0, p: 0, listStyle: 'none', gap: 0.5 }}>
        {shown.map((i) => <li key={i.key}><Link component={RouterLink} to={i.to} variant="body2" underline="hover">{i.text}</Link></li>)}
      </Stack>
      {group.items.length > LIMIT ? <Link component="button" type="button" variant="caption" onClick={() => setAll(!all)} sx={{ mt: 0.5 }}>{all ? 'Show fewer' : `Show all ${group.items.length}`}</Link> : null}
    </Box>
  );
}

/** What moved between the comparison review and the viewed one. Every item opens the finding journey behind it. */
export function OverviewSinceReview({ view }: { view: PortfolioView }) {
  const { scope, comparisonSnapshot } = useReview();
  const q = useSinceReview(scope.comparisonSnapshotId, scope.viewSnapshotId);
  const allFindings = useFindings().data ?? [];
  const href = usePanelHref();
  const since = weekLabel(comparisonSnapshot);
  const title = since ? `Since the ${since} review` : 'Since last review';

  if (!scope.comparisonSnapshotId) return <SectionCard title={title} badge="Calculated"><EmptyState title="No earlier review to compare with" hint="This is the first recorded review." /></SectionCard>;
  if (q.isError) return <SectionCard title={title} badge="Calculated"><ErrorState message="The comparison could not be calculated." onRetry={() => void q.refetch()} /></SectionCard>;
  if (q.isLoading) return <SectionCard title={title} badge="Calculated"><LoadingState rows={3} /></SectionCard>;
  if (!q.data) return <SectionCard title={title} badge="Calculated"><EmptyState title="Comparison not available" hint="Choose another comparison review in the review bar." /></SectionCard>;

  const scoped = findingsFor(allFindings, [...view.projects.map((p) => p.id), ...view.programmes.map((p) => p.id)]);
  const byId = new Map(scoped.map((f) => [f.id, f]));
  const finding = (id: string, suffix = ''): Item[] => {
    const f = byId.get(id);
    return f ? [{ key: id, text: `${f.title}${suffix}`, to: href({ finding: id }) }] : [];
  };
  const name = (id: string) => view.projects.find((p) => p.id === id)?.name;
  const move = (m: (typeof q.data.worsened)[number]): Item[] => {
    const n = name(m.projectId);
    if (!n) return [];
    const f = view.findings.find((x) => x.affectedIds.includes(m.projectId) && DIM_CATEGORY[m.dimension].includes(x.category));
    return [{ key: `${m.projectId}:${m.dimension}`, text: `${n}, ${DIM_LABEL[m.dimension].toLowerCase()}: ${CONDITION_SHORT[m.from].toLowerCase()} to ${CONDITION_SHORT[m.to].toLowerCase()}`, to: f ? href({ finding: f.id }) : `/projects/${m.projectId}` }];
  };
  const d = q.data;
  const groups: Group[] = [
    { title: 'New', items: d.newFindingIds.flatMap((id) => finding(id)) },
    { title: 'Changed', items: d.changedFindingIds.flatMap((id) => finding(id)) },
    { title: 'Resolved', items: d.resolvedFindingIds.flatMap((id) => finding(id)) },
    { title: 'Still open', items: d.persisting.flatMap((p) => finding(p.id, `, open ${p.weeks} week${p.weeks === 1 ? '' : 's'}`)) },
    { title: 'Positions worsened', items: d.worsened.flatMap(move) },
    { title: 'Positions improved', items: d.improved.flatMap(move) },
  ];
  const count = (t: string) => groups.find((g) => g.title === t)?.items.length ?? 0;
  const summary = `${count('New')} new, ${count('Changed')} changed and ${count('Resolved')} resolved findings; ${count('Still open')} still open. `
    + `${count('Positions worsened')} position${count('Positions worsened') === 1 ? '' : 's'} worsened and ${count('Positions improved')} improved.`;
  const present = groups.filter((g) => g.items.length);

  return (
    <SectionCard title={title} badge="Calculated" subtitle={summary}>
      {present.length ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          {present.map((g) => <GroupList key={g.title} group={g} />)}
        </Box>
      ) : <EmptyState title="Nothing moved" hint="No finding or position changed between these reviews." />}
    </SectionCard>
  );
}
