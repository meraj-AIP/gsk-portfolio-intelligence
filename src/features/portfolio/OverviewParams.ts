import { useSearchParams } from 'react-router-dom';

export type OverviewMode = 'board' | 'matrix' | 'stage';
const MODES: OverviewMode[] = ['board', 'matrix', 'stage'];

/**
 * Overview view, stage filter, matrix search and page live in the URL so a shared link reopens the same view.
 * The matrix keys are prefixed (mq, mpage) because q and page already belong to the ask panel and constraints list.
 * Patches go through one setter because separate setters in the same tick would overwrite each other.
 */
export function useOverviewParams() {
  const [sp, setSp] = useSearchParams();
  const raw = sp.get('view') ?? '';
  const view: OverviewMode = (MODES as string[]).includes(raw) ? (raw as OverviewMode) : 'board';
  const page = Math.max(1, Number(sp.get('mpage') ?? 1) || 1);
  const patch = (next: Record<string, string | number | null>) => setSp((prev) => {
    const copy = new URLSearchParams(prev);
    Object.entries(next).forEach(([k, v]) => (v === null || v === '' ? copy.delete(k) : copy.set(k, String(v))));
    return copy;
  }, { replace: true });
  return { view, stage: sp.get('stage') ?? '', q: sp.get('mq') ?? '', page, patch };
}
