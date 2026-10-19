import type { Commitment, Condition, Project } from '@/shared/types/domain';
import { DIMENSIONS } from '@/shared/types/domain';
import type { Tone } from '@/shared/components/ui/StatusChip';
import type { Stage as TrackStage } from '@/shared/components/ui/StageGateTrack';
import { worstCondition } from './matrixConfig';

/** Lifecycle stages drawn on the track. Idea and Paused sit outside the gated flow, so they are not drawn. */
export const FLOW = ['Scoping', 'Build', 'Vetting', 'Live', 'Scaling'] as const;

const RANK: Record<Condition, number> = { breached: 4, attention: 3, unknown: 2, reported: 1, met: 0 };
const isException = (c: Condition) => c === 'breached' || c === 'attention';

export const worstOf = (p: Project): Condition => worstCondition([p]);
export const exceptionCount = (p: Project) => DIMENSIONS.filter((d) => isException(p.position[d])).length;
export const onTrack = (p: Project) => exceptionCount(p) === 0;
export const allGatesPassed = (p: Project) => p.gates.length > 0 && p.gates.every((g) => g.status === 'passed');
export const pendingGates = (p: Project) => p.gates.filter((g) => g.status !== 'passed').length;

/** Most severe first: worst condition, then how many dimensions carry an exception. */
export function bySeverity(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => RANK[worstOf(b)] - RANK[worstOf(a)] || exceptionCount(b) - exceptionCount(a) || a.name.localeCompare(b.name));
}

/** Matrix risk wording from the worst condition. Unknown is never called low risk, because nothing was assessed. */
export function riskOf(p: Project): { label: string; tone: Tone } {
  const w = worstOf(p);
  if (w === 'breached') return { label: 'High', tone: 'danger' };
  if (w === 'attention') return { label: 'Moderate', tone: 'warning' };
  if (w === 'unknown') return { label: 'Not assessed', tone: 'neutral' };
  return { label: 'Low risk', tone: 'success' };
}

/** Share of the gated lifecycle a project has reached, counting its current stage as reached. */
export function lifecyclePercent(p: Project): number {
  const i = (FLOW as readonly string[]).indexOf(p.stage);
  return i < 0 ? 0 : Math.round(((i + 1) / FLOW.length) * 100);
}

/** The next commitment still without an actual date, earliest first. */
export function nextMilestone(projectId: string, commitments: Commitment[]): Commitment | undefined {
  return commitments.filter((c) => c.projectId === projectId && !c.actualDate).sort((a, b) => a.currentDate.localeCompare(b.currentDate))[0];
}

/** The gate most often still open among a stage's projects; that is the gate holding the stage back. */
function stageGate(projects: Project[]): string {
  const open = new Map<string, number>();
  projects.flatMap((p) => p.gates).filter((g) => g.status !== 'passed').forEach((g) => open.set(g.name, (open.get(g.name) ?? 0) + 1));
  const top = [...open.entries()].sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : projects.length ? 'All gates passed' : 'No projects';
}

/** One track tile per stage. The stage holding the most breaches plus open gates is the active one. */
export function stageTrack(projects: Project[]): (TrackStage & { projects: Project[] })[] {
  const rows = FLOW.map((label) => {
    const own = projects.filter((p) => p.stage === label);
    const blocked = own.filter((p) => worstOf(p) === 'breached').length;
    const pending = own.reduce((n, p) => n + pendingGates(p), 0);
    return { label, own, blocked, pending, load: blocked + pending };
  });
  const maxLoad = Math.max(0, ...rows.map((r) => r.load));
  const activeLabel = maxLoad > 0 ? rows.find((r) => r.load === maxLoad)?.label : undefined;
  return rows.map((r) => {
    const fine = r.own.filter(onTrack).length;
    const footRight: TrackStage['footRight'] = r.blocked ? { text: `${r.blocked} blocked`, tone: 'danger' }
      : r.pending ? { text: `${r.pending} gate${r.pending === 1 ? '' : 's'} pending`, tone: 'warning' }
      : r.own.length ? { text: '0 blocked', tone: 'success' } : undefined;
    return {
      key: r.label,
      label: r.label,
      count: r.own.length,
      meta: r.own.length ? `${fine} on track` : undefined,
      footLeft: stageGate(r.own),
      footRight,
      state: r.label === activeLabel ? 'active' : r.own.length ? 'completed' : 'upcoming',
      fill: r.own.length ? Math.round((fine / r.own.length) * 100) : 0,
      projects: r.own,
    };
  });
}

/** Comma list with "and" before the last item, for subtitles built from data. */
export const listOf = (items: string[]) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`);
