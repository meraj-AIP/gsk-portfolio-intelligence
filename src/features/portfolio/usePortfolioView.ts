import { useReview } from '@/app/context/ReviewContext';
import { useAllProjects, useFindings, useProgrammes, useSnapshotComparison, useSnapshotContent } from '@/shared/api/hooks';
import { findingsFor, scopeProjectIds } from '@/shared/lib/portfolio';
import type { Project } from '@/shared/types/domain';

/** Key for one matrix cell, used to look up what it was in the comparison review. */
export const cellKey = (projectId: string, dimension: string) => `${projectId}:${dimension}`;

/**
 * Everything the overview shows, taken from the viewed review rather than live records,
 * and narrowed to the portfolio scope chosen in the review bar.
 */
export function usePortfolioView() {
  const { scope, viewSnapshot, comparisonSnapshot } = useReview();
  const programmes = useProgrammes();
  const projects = useAllProjects();
  const findings = useFindings();
  const content = useSnapshotContent(scope.viewSnapshotId);
  const comparison = useSnapshotComparison(scope.comparisonSnapshotId, scope.viewSnapshotId);

  const queries = [programmes, projects, findings, content];
  const isError = queries.some((q) => q.isError);
  const retry = () => queries.forEach((q) => void q.refetch());
  if (isError || !programmes.data || !projects.data || !findings.data || !content.data) {
    return { status: isError ? ('error' as const) : ('loading' as const), retry };
  }

  const snap = content.data.content;
  const ids = scopeProjectIds(projects.data, scope.portfolio);
  const pgs = programmes.data.filter((p) => scope.portfolio === 'All programmes' || p.id === scope.portfolio);
  const prjs: Project[] = projects.data.filter((p) => ids.includes(p.id)).map((p) => ({
    ...p, position: snap.positions[p.id] ?? p.position, freshness: snap.freshness[p.id] ?? p.freshness,
  }));
  const inReview = new Set(snap.findings.map((f) => f.id));
  const fnds = findingsFor(findings.data, [...ids, ...pgs.map((p) => p.id)]).filter((f) => inReview.has(f.id));
  const changes = (comparison.data?.changes ?? []).filter((c) => ids.includes(c.projectId));
  const was = new Map(changes.map((c) => [cellKey(c.projectId, c.dimension), c.from]));

  return {
    status: 'ready' as const,
    retry,
    programmes: pgs,
    projects: prjs,
    findings: fnds,
    changes,
    was,
    viewSnapshot,
    comparisonSnapshot,
    amendments: viewSnapshot?.status === 'amended' ? viewSnapshot.amendments ?? [] : [],
  };
}

export type PortfolioView = Extract<ReturnType<typeof usePortfolioView>, { status: 'ready' }>;
