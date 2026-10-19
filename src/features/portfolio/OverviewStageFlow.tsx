import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState } from '@/shared/components/StatePanels';
import { StageGateTrack, StageLegend } from '@/shared/components/ui/StageGateTrack';
import type { Project } from '@/shared/types/domain';
import { stageTrack, worstOf } from './OverviewModel';
import { useOverviewParams } from './OverviewParams';

function StageProjects({ projects }: { projects: Project[] }) {
  if (!projects.length) return <Typography variant="caption" sx={{ color: 'text.secondary' }}>No projects at this stage</Typography>;
  return (
    <Stack sx={{ gap: 0.75 }}>
      {projects.map((p) => (
        <Stack key={p.id} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Link component={RouterLink} to={`/projects/${p.id}`} variant="body2" sx={{ fontWeight: 600, minWidth: 0 }} noWrap>{p.name}</Link>
          <ConditionChip condition={worstOf(p)} compact />
        </Stack>
      ))}
    </Stack>
  );
}

/** Lifecycle flow. Selecting a stage narrows the cards and the matrix; selecting it again clears the filter. */
export function OverviewStageFlow({ projects, expanded = false }: { projects: Project[]; expanded?: boolean }) {
  const { stage, patch } = useOverviewParams();
  const track = stageTrack(projects);
  return (
    <SectionCard
      title="Pipeline stage-gate flow"
      badge="Lifecycle view"
      subtitle="Projects by lifecycle stage, with the governance gate still open at each stage and how many are on track."
      actions={<StageLegend />}
    >
      {!projects.length ? <EmptyState title="No projects in this scope" hint="Choose another programme above." /> : (
        <>
          <StageGateTrack stages={track} selected={stage} onSelect={(k) => patch({ stage: k === stage ? null : k, mpage: null })} />
          {expanded ? (
            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: `repeat(${track.length}, 1fr)` }, gap: 1 }}>
              {track.map((s) => (
                <Box key={s.key} sx={(t) => ({ p: 1.25, borderRadius: 2, border: `1px solid ${t.palette.divider}` })}>
                  <Typography variant="overline" component="h3" sx={{ mb: 1 }}>{s.label}</Typography>
                  <StageProjects projects={s.projects} />
                </Box>
              ))}
            </Box>
          ) : null}
        </>
      )}
    </SectionCard>
  );
}
