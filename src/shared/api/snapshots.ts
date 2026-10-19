import { pastFindingPositions, pastFreshness, pastPositions } from '@/mock/workflow';
import type { Project, Snapshot } from '@/shared/types/domain';
import type { SnapshotContent } from '@/shared/types/workflow';
import type { Store } from './store';

type Live = Pick<Store, 'projects' | 'commitments' | 'findings' | 'definitions'>;

/** Freezes what the store knows right now. Used when a review closes and to answer "what does the open review show". */
export function captureContent(s: Live, frozenAt: string, frozenBy: string): SnapshotContent {
  return {
    positions: Object.fromEntries(s.projects.map((p) => [p.id, { ...p.position }])),
    freshness: Object.fromEntries(s.projects.map((p) => [p.id, p.freshness])),
    commitmentDates: Object.fromEntries(s.commitments.map((c) => [c.id, c.currentDate])),
    findings: s.findings.map((f) => ({ id: f.id, title: f.title, version: f.version, currentPosition: f.currentPosition })),
    definitionVersions: Object.fromEntries(s.definitions.map((d) => [d.id, d.version])),
    frozenAt,
    frozenBy,
  };
}

/** Earlier reviews were closed before this build; their content is reconstructed once from the recorded differences. */
export function seedPastSnapshots(s: Live & { snapshots: Snapshot[] }): void {
  s.snapshots.forEach((snap) => {
    if (snap.status === 'open' || snap.content) return;
    const base = captureContent(s, `${snap.date} 18:00`, 'Devon Carlisle');
    const overrides = pastPositions[snap.id] ?? {};
    Object.entries(overrides).forEach(([pid, cells]) => { base.positions[pid] = { ...base.positions[pid]!, ...cells }; });
    Object.entries(pastFreshness[snap.id] ?? {}).forEach(([pid, f]) => { base.freshness[pid] = f; });
    base.findings = base.findings.filter((f) => {
      const live = s.findings.find((x) => x.id === f.id);
      return live && weekNumber(live.firstSeenWeek) <= weekNumber(snap.week);
    }).map((f) => ({ ...f, currentPosition: pastFindingPositions[snap.id]?.[f.id] ?? f.currentPosition }));
    snap.content = base;
  });
}

export function weekNumber(week: string): number {
  return Number(week.split('-W')[1] ?? week.replace(/\D/g, ''));
}

export type PositionChange = { projectId: string; dimension: string; from: string; to: string };

/** Cell-by-cell differences between two frozen positions, for "changed since the comparison review". */
export function diffPositions(from: SnapshotContent, to: SnapshotContent, projects: Project[]): PositionChange[] {
  return projects.flatMap((p) => {
    const a = from.positions[p.id];
    const b = to.positions[p.id];
    if (!a || !b) return [];
    return (Object.keys(b) as (keyof typeof b)[]).filter((k) => a[k] !== b[k]).map((k) => ({ projectId: p.id, dimension: k, from: a[k], to: b[k] }));
  });
}
