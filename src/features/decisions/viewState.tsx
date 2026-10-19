import Stack from '@mui/material/Stack';
import { useReview } from '@/app/context/ReviewContext';
import { useAuth } from '@/features/auth/AuthContext';
import { today } from '@/shared/api/store';
import { StatusChip, type Tone } from '@/shared/components/ui/StatusChip';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { daysBetween } from '@/shared/lib/format';
import type { Action, Page } from '@/shared/types/domain';
import { MatrixPager } from '@/shared/components/ui/MatrixPager';

export const PAGE_SIZE = 10;

/** Page and "everyone" live in the URL so a shared link or a refresh lands on the same rows. Default is the user's own items. */
export function useListParams() {
  const { user } = useAuth();
  const { scope } = useReview();
  const [pageRaw, setPage] = useUrlParam('page');
  const [allRaw] = useUrlParam('all');
  const mine = allRaw !== '1';
  const page = Math.max(0, Number(pageRaw) || 0);
  return {
    mine,
    me: user?.name ?? '',
    setPage: (n: number) => setPage(n ? String(n) : null),
    params: { page, pageSize: PAGE_SIZE, scope: scope.portfolio, ...(mine && user ? { owner: user.name } : {}) },
  };
}

export function Pager<T>({ data, onPage, noun }: { data: Page<T>; onPage: (n: number) => void; noun: string }) {
  return <MatrixPager data={data} onPage={onPage} noun={noun} />;
}

/** Reported completion is not verified completion, so the two get different tones. */
export const ACTION_TONE: Record<Action['status'], Tone> = {
  open: 'neutral', 'in progress': 'info', blocked: 'danger', 'reported complete': 'warning', 'verified complete': 'success',
};

export const capitalise = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

/** Aging shows both how long an item has been open and, separately, how far past due it is. */
export function Aging({ openedOn, dueDate, closed }: { openedOn?: string; dueDate?: string; closed?: boolean }) {
  if (closed) return <StatusChip tone="neutral" dot={false}>Closed</StatusChip>;
  const overdue = dueDate ? daysBetween(dueDate, today) : 0;
  return (
    <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
      {openedOn ? <StatusChip tone="neutral" dot={false}>Open {Math.max(0, daysBetween(openedOn, today))}d</StatusChip> : null}
      {overdue > 0 ? <StatusChip tone="danger">Overdue {overdue}d</StatusChip> : null}
      {!openedOn && dueDate && overdue <= 0 ? <StatusChip tone="neutral" dot={false}>{overdue === 0 ? 'Due today' : `Due in ${-overdue}d`}</StatusChip> : null}
    </Stack>
  );
}
