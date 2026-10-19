import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth, type Role } from '@/features/auth/AuthContext';
import { useSnapshots } from '@/shared/api/hooks';
import type { Snapshot } from '@/shared/types/domain';

export type ReviewScope = { portfolio: string; reportingDate: string; viewSnapshotId: string; comparisonSnapshotId: string; role: Role };

type Choice = Pick<ReviewScope, 'portfolio' | 'viewSnapshotId' | 'comparisonSnapshotId'>;

type ReviewContextValue = {
  scope: ReviewScope;
  setScope: (patch: Partial<Choice>) => void;
  viewSnapshot: Snapshot | undefined;
  comparisonSnapshot: Snapshot | undefined;
  /** Comparisons offered for the viewed review: closed or amended reviews before it. */
  comparisonOptions: Snapshot[];
  /** True when a closed or amended review is selected; screens must not offer writes against it. */
  isReadOnly: boolean;
};

const ReviewContext = createContext<ReviewContextValue | null>(null);
const INITIAL: Choice = { portfolio: 'All programmes', viewSnapshotId: '', comparisonSnapshotId: '' };

/** Selected portfolio, review and comparison persist across every screen. Role comes from the signed-in user. */
export function ReviewProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const snapshots = useSnapshots();
  const [choice, setChoice] = useState<Choice>(INITIAL);
  useEffect(() => { setChoice(INITIAL); }, [user?.id]);

  const value = useMemo<ReviewContextValue>(() => {
    const all = [...(snapshots.data ?? [])].sort((a, b) => a.date.localeCompare(b.date));
    const view = all.find((s) => s.id === choice.viewSnapshotId) ?? all.find((s) => s.status === 'open') ?? all.at(-1);
    const comparisonOptions = all.filter((s) => s.status !== 'open' && view && s.date < view.date);
    const comparison = comparisonOptions.find((s) => s.id === choice.comparisonSnapshotId) ?? comparisonOptions.at(-1);
    return {
      scope: {
        portfolio: choice.portfolio,
        reportingDate: view?.date ?? '',
        viewSnapshotId: view?.id ?? '',
        comparisonSnapshotId: comparison?.id ?? '',
        role: user?.role ?? 'Project lead',
      },
      // A new review invalidates the old comparison choice, so it falls back to the latest earlier one.
      // Picking the open review is stored as "follow the current review", so closing it moves the header to the next week.
      setScope: (patch) => setChoice((s) => {
        const next = { ...s, ...(patch.viewSnapshotId !== undefined ? { comparisonSnapshotId: '' } : {}), ...patch };
        if (patch.viewSnapshotId && patch.viewSnapshotId === all.find((x) => x.status === 'open')?.id) next.viewSnapshotId = '';
        return next;
      }),
      viewSnapshot: view,
      comparisonSnapshot: comparison,
      comparisonOptions,
      isReadOnly: Boolean(view && view.status !== 'open'),
    };
  }, [choice, snapshots.data, user?.role]);
  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

export function useReview(): ReviewContextValue {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error('useReview must be used inside ReviewProvider');
  return ctx;
}
