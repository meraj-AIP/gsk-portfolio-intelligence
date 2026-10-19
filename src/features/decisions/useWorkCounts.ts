import { useReview } from '@/app/context/ReviewContext';
import { useActionPage, useClarificationPage, useDecisionPage, useFindingPage } from '@/shared/api/hooks';
import { today } from '@/shared/api/store';

// Counts read every matching row in one page so they agree with what the tables page through.
const ALL_ROWS = 1000;

export type WorkCounts = { responses: number; clarifications: number; decisions: number; openActions: number; overdue: number; since?: string };

/** Totals for the KPI row and the header. owner narrows to one person; decisions are never narrowed, as in the table. */
export function useWorkCounts(owner: string | undefined) {
  const { scope, comparisonSnapshot } = useReview();
  const who = owner ? { owner } : {};
  const responses = useFindingPage({ page: 0, pageSize: 1, scope: scope.portfolio, awaiting: true, ...who });
  const clarifications = useClarificationPage({ page: 0, pageSize: 1, status: 'open', ...who });
  const decisions = useDecisionPage({ page: 0, pageSize: ALL_ROWS, scope: scope.portfolio });
  const actions = useActionPage({ page: 0, pageSize: ALL_ROWS, scope: scope.portfolio, ...who });
  const queries = [responses, clarifications, decisions, actions];

  let counts: WorkCounts | null = null;
  if (responses.data && clarifications.data && decisions.data && actions.data) {
    // "This period" is everything decided since the review the header compares against.
    const since = comparisonSnapshot?.date;
    const open = actions.data.items.filter((a) => a.status !== 'verified complete' && a.status !== 'reported complete');
    counts = {
      responses: responses.data.total,
      clarifications: clarifications.data.total,
      decisions: decisions.data.items.filter((d) => !since || d.date > since).length,
      openActions: open.length,
      overdue: open.filter((a) => a.dueDate < today).length,
      ...(comparisonSnapshot ? { since: comparisonSnapshot.label } : {}),
    };
  }
  return {
    counts,
    isError: queries.some((q) => q.isError),
    retry: () => queries.forEach((q) => void q.refetch()),
  };
}
