import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useConstraintTrace } from '@/shared/api/hooks';
import { ClarificationDialog } from '@/shared/components/RequestDialogs';
import { EntityLink } from '@/shared/components/EntityLink';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
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

/** Rows outside the selected portfolio are counted, not shown, so the trace matches the scope the review is looking at. */
export function ConstraintTrace({ constraint: c, scopeIds, focusId }: Props) {
  const trace = useConstraintTrace(c.node.id);
  const [asking, setAsking] = useState(false);

  if (trace.isError) return <ErrorState message="The trace for this constraint could not be loaded." onRetry={() => void trace.refetch()} />;
  if (!trace.data) return <LoadingState rows={4} />;
  const rows = trace.data.filter((r) => scopeIds.includes(r.projectId));
  const outside = new Set(trace.data.filter((r) => !scopeIds.includes(r.projectId)).map((r) => r.projectId)).size;
  const owner = c.node.owner ?? rows[0]?.dependency.owner ?? '';

  return (
    <Stack sx={{ gap: 2 }}>
      <Box>
        <Typography variant="body2">{KIND_SINGULAR[c.node.kind]}, {owner ? `owned by ${owner}` : 'owner not recorded'}. {plural(rows.length, 'dependency')} in this portfolio{outside ? `; ${plural(outside, 'more project')} outside it also rely on it` : ''}.</Typography>
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1 }}>
          <Button variant="outlined" size="small" disabled={!owner} onClick={() => setAsking(true)}>Request clarification from {owner || 'owner'}</Button>
          {c.findingIds.length ? <Typography variant="caption">Linked findings:</Typography> : <Typography variant="caption">No findings linked to this constraint.</Typography>}
          {c.findingIds.map((id) => <EntityLink key={id} id={id} label={`Open ${id}`} />)}
        </Stack>
      </Box>
      {rows.length === 0 ? <EmptyState title="Nothing in this portfolio depends on it" hint="The constraint is shared by projects outside the selected portfolio." /> : null}
      {group(rows).map(([pgId, pg]) => (
        <Box key={pgId} component="section" aria-label={pg.name}>
          <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', letterSpacing: 0.4, color: 'text.secondary', mb: 1 }}>{pg.name}</Typography>
          <Stack sx={{ gap: 1.5 }}>
            {[...pg.projects.entries()].map(([pid, deps]) => (
              <Box key={pid} sx={{ borderTop: 1, borderColor: 'divider', pt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}><EntityLink id={pid} label={deps[0]!.projectName} /></Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>Project owner {deps[0]!.projectOwner}</Typography>
                <Stack sx={{ gap: 1.5 }}>{deps.map((r) => <ConstraintTraceItem key={r.dependency.id} row={r} focused={r.dependency.id === focusId} />)}</Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      ))}
      {asking ? <ClarificationDialog open onClose={() => setAsking(false)} targetId={c.node.id} owner={owner} prompt={`About ${c.node.label}: `} /> : null}
    </Stack>
  );
}
