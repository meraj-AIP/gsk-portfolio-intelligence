import { useNavigate } from 'react-router-dom';
import { SectionCard } from '@/shared/components/SectionCard';
import { StageGateTrack, type Stage as TrackStage } from '@/shared/components/ui/StageGateTrack';
import { STAGES, type Project } from '@/shared/types/domain';
import { worstOf } from './directoryModel';

/**
 * The programme's projects by lifecycle stage. A stage turns orange when it holds a project needing attention;
 * the rule is the share of that stage's projects meeting their delivery commitment.
 */
export function ProgrammeStageTrack({ programmeId, projects }: { programmeId: string; projects: Project[] }) {
  const navigate = useNavigate();
  const stages: TrackStage[] = STAGES.filter((s) => s !== 'Paused' || projects.some((p) => p.stage === s)).map((s) => {
    const here = projects.filter((p) => p.stage === s);
    const onTrack = here.filter((p) => p.position.delivery === 'met').length;
    const flagged = here.filter((p) => ['breached', 'attention'].includes(worstOf(p.position).condition)).length;
    return {
      key: s, label: s, count: here.length,
      meta: here.length ? `${here.length === 1 ? 'project' : 'projects'}` : 'none',
      footLeft: here.length ? `${onTrack} on commitment` : 'Not reached',
      ...(flagged ? { footRight: { text: `${flagged} need${flagged === 1 ? 's' : ''} attention`, tone: 'warning' as const } } : {}),
      state: !here.length ? 'upcoming' : flagged ? 'active' : 'completed',
      fill: here.length ? (onTrack / here.length) * 100 : 0,
    };
  });
  return (
    <SectionCard title="Projects by lifecycle stage" badge="Calculated" sx={{ mb: 3 }}
      subtitle="Orange marks a stage holding a project that needs attention. The rule shows the share meeting their delivery commitment. Select a stage to list its projects.">
      <StageGateTrack stages={stages} onSelect={(s) => navigate(`/directory?programme=${programmeId}&stage=${encodeURIComponent(s)}`)} />
    </SectionCard>
  );
}
