import { useMemo } from 'react';
import { useReview } from '@/app/context/ReviewContext';
import { useAllProjects, useCommitments, useFindings, useReleases, useScopeChanges } from '@/shared/api/hooks';
import { scopeProjectIds } from '@/shared/lib/portfolio';
import { buildQueue, type ReviewPeriod } from './weekModel';

/**
 * The week's queue in the selected portfolio. Shared by the KPI row and the timeline tab so both count the same records;
 * TanStack Query dedupes the fetches.
 */
export function useWeekQueue(period: ReviewPeriod) {
  const { scope } = useReview();
  const projects = useAllProjects();
  const commitments = useCommitments();
  const scopeChanges = useScopeChanges();
  const releases = useReleases();
  const findings = useFindings();
  const queries = [projects, commitments, scopeChanges, releases, findings];

  const ids = useMemo(() => (projects.data ? scopeProjectIds(projects.data, scope.portfolio) : []), [projects.data, scope.portfolio]);
  const items = useMemo(() => {
    if (!projects.data || !commitments.data || !scopeChanges.data || !releases.data || !findings.data) return [];
    return buildQueue(projects.data, commitments.data, scopeChanges.data, releases.data, findings.data, period).filter((i) => !i.projectId || ids.includes(i.projectId));
  }, [period, projects.data, commitments.data, scopeChanges.data, releases.data, findings.data, ids]);

  const data = projects.data && commitments.data && scopeChanges.data && releases.data && findings.data
    ? { commitments: commitments.data, releases: releases.data }
    : null;
  return {
    items,
    ids,
    data,
    isError: queries.some((q) => q.isError),
    retry: () => queries.forEach((q) => void q.refetch()),
  };
}
