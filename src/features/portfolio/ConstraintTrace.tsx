import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useConstraintTrace } from '@/shared/api/hooks';
import { ClarificationDialog } from '@/shared/components/RequestDialogs';
import { EntityLink } from '@/shared/components/EntityLink';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { DomainTag } from '@/shared/components/ui/StatusChip';
import type { TraceRow } from '@/shared/lib/constraints';
import { KIND_SINGULAR, plural, type ScopedConstraint } from './ConstraintModel';
import { ConstraintTraceItem } from './ConstraintTraceItem';

type Props = { constraint: ScopedConstraint; scopeIds: string[]; focusId: string };

/** Programme, then project, then each dependency on the constraint, keeping the order the trace arrives in. */
function group(rows: TraceRow[]) {
  const programmes = new Map<string, { name: string; projects: Map<string, TraceRow[]> }>();
  rows.forEach((r) => {
    const pg = programmes.get(r.programmeId) ?? { name: r.programmeName, projects: new Map<string, TraceRow[]>() };
    pg.projects.set(r.projectId, [...(pg.projects.get(r.projectId) ?? []), r]);
    programmes.set(r.programmeId, pg);
  });
  return [...programmes.entries()];
}

function ProgrammeCard({ name, projects, focusId }: { name: string; projects: Map<string, TraceRow[]>; focusId: string }) {
  const deps = [...projects.values()].reduce((n, d) => n + d.length, 0);
  return (
    <Box component="section" aria-label={name} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Stack direction="row" sx={(t) => ({ px: 2, py: 1.25, gap: 1, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', bgcolor: t.palette.brand.canvas, borderBottom: `1px solid ${t.palette.divider}` })}>
        <DomainTag strong>{name}</DomainTag>
        <Typography variant="label" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{plural(projects.size, 'project')}, {plural(deps, 'dependency')}</Typography>
      </Stack>
      <Stack sx={{ p: 2, gap: 2.5 }}>
        {[...projects.entries()].map(([pid, rows]) => (
          <Stack key={pid} sx={{ gap: 1.25 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" component="h4"><EntityLink id={pid} label={rows[0]!.projectName} /></Typography>
              <AvatarName name={rows[0]!.projectOwner} subtitle="Project owner" size={24} />
            </Stack>
            {rows.map((r) => <ConstraintTraceItem key={r.dependency.id} row={r} focused={r.dependency.id === focusId} />)}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

/** Rows outside the selected portfolio are counted, not shown, so the trace matches the scope the review is looking at. */
export function ConstraintTrace({ constraint: c, scopeIds, focusId }: Props) {
  const trace = useConstraintTrace(c.node.id);
  const [asking, setAsking] = useState(false);
  const title = `Trace: ${c.node.label}`;

  if (trace.isError) return <SectionCard title={title}><ErrorState message="The trace for this constraint could not be loaded." onRetry={() => void trace.refetch()} /></SectionCard>;
  if (!trace.data) return <SectionCard title={title}><LoadingState rows={4} /></SectionCard>;
  const rows = trace.data.filter((r) => scopeIds.includes(r.projectId));
  const outside = new Set(trace.data.filter((r) => !scopeIds.includes(r.projectId)).map((r) => r.projectId)).size;
  const owner = c.node.owner ?? rows[0]?.dependency.owner ?? '';

  return (
    <SectionCard title={title} badge={plural(rows.length, 'dependency')}
      subtitle={`${KIND_SINGULAR[c.node.kind]}. ${plural(rows.length, 'dependency')} in this portfolio${outside ? `; ${plural(outside, 'more project')} outside it also rely on it` : ''}.`}
      actions={<Button variant="outlined" disabled={!owner} aria-label={owner ? `Request clarification from ${owner}` : 'Request clarification, owner not recorded'} onClick={() => setAsking(true)}>Request clarification</Button>}>
      <Stack sx={{ gap: 2 }}>
        <Stack direction="row" sx={{ gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          {owner ? <AvatarName name={owner} subtitle="Constraint owner" /> : <Typography variant="body2" sx={{ color: 'text.secondary' }}>Owner not recorded</Typography>}
          <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="overline">Linked findings</Typography>
            {c.findingIds.length ? c.findingIds.map((id) => <EntityLink key={id} id={id} label={`Open ${id}`} />) : <Typography variant="body2" sx={{ color: 'text.secondary' }}>None</Typography>}
          </Stack>
        </Stack>
        {rows.length === 0 ? <EmptyState title="Nothing in this portfolio depends on it" hint="The constraint is shared by projects outside the selected portfolio." /> : null}
        {group(rows).map(([pgId, pg]) => <ProgrammeCard key={pgId} name={pg.name} projects={pg.projects} focusId={focusId} />)}
      </Stack>
      {asking ? <ClarificationDialog open onClose={() => setAsking(false)} targetId={c.node.id} owner={owner} prompt={`About ${c.node.label}: `} /> : null}
    </SectionCard>
  );
}
