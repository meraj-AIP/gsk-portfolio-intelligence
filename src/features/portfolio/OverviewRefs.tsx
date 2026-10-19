import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useActions, useAllProjects, useCommitments, useFindings, useGraphNodes, useProgrammes, useReleases } from '@/shared/api/hooks';
import type { AssessmentLine } from '@/shared/lib/assessment';
import { usePanelHref } from './OverviewLinks';

const MAX_REFS = 6;
const clip = (s: string) => (s.length > 48 ? `${s.slice(0, 46).trimEnd()}...` : s);

/** An empty `to` means the record has no view of its own, so it is shown as plain text. */
type Target = { label: string; to: string };

/** Turns a record id into a readable label and the place that shows it: a panel, a tab or the owning record. */
function useRefTarget() {
  const href = usePanelHref();
  const programmes = useProgrammes().data ?? [];
  const findings = useFindings().data ?? [];
  const projects = useAllProjects().data ?? [];
  const commitments = useCommitments().data ?? [];
  const releases = useReleases().data ?? [];
  const nodes = useGraphNodes().data ?? [];
  const actions = useActions().data ?? [];

  return (id: string, line: AssessmentLine['key']): Target => {
    // The constraints line only ever cites graph nodes, and node ids can share prefixes with other records.
    if (line === 'constraints') return { label: nodes.find((n) => n.id === id)?.label ?? id, to: href({ tab: 'constraints', constraint: id }) };
    if (id.startsWith('F-')) return { label: findings.find((f) => f.id === id)?.title ?? id, to: href({ finding: id }) };
    if (id.startsWith('E-')) return { label: `Evidence ${id}`, to: href({ evidence: id }) };
    if (id.startsWith('PG-')) return { label: programmes.find((p) => p.id === id)?.name ?? id, to: `/programmes/${id}` };
    if (id.startsWith('P-')) return { label: projects.find((p) => p.id === id)?.name ?? id, to: `/projects/${id}` };
    if (id.startsWith('R-')) return { label: releases.find((r) => r.id === id)?.capability ?? id, to: `/this-week?tab=releases&release=${id}` };
    if (id.startsWith('A-')) return { label: actions.find((a) => a.id === id)?.title ?? id, to: '/decisions' };
    const commitment = commitments.find((c) => c.id === id);
    if (commitment) return { label: commitment.title, to: `/projects/${commitment.projectId}` };
    return { label: id, to: '' };
  };
}

/** Small links under an assessment line so each sentence can be traced to the records it counts. */
export function OverviewRefs({ line }: { line: AssessmentLine }) {
  const target = useRefTarget();
  const refs = [...new Set(line.refs)];
  if (!refs.length) return null;
  const shown = refs.slice(0, MAX_REFS);
  return (
    <Stack direction="row" sx={{ gap: 0.5, columnGap: 1.25, flexWrap: 'wrap', mt: 0.5 }} aria-label={`Records behind ${line.heading.toLowerCase()}`}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Based on</Typography>
      {shown.map((id) => {
        const t = target(id, line.key);
        return t.to
          ? <Link key={id} component={RouterLink} to={t.to} variant="caption" underline="always" title={id}>{clip(t.label)}</Link>
          : <Typography key={id} variant="caption">{clip(t.label)}</Typography>;
      })}
      {refs.length > shown.length ? <Typography variant="caption" sx={{ color: 'text.secondary' }}>and {refs.length - shown.length} more</Typography> : null}
    </Stack>
  );
}
