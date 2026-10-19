import { useBriefingFigures, useSnapshots } from '@/shared/api/hooks';
import type { Briefing } from '@/shared/types/domain';
import { briefingExtras, figureCells, type BriefingExtras, type FigureCell } from './briefingFigures';
import type { BriefingItem } from './useBriefingItems';

export type ExtrasState = { extras: BriefingExtras | null; cells: FigureCell[] | null; loading: boolean; error: boolean; retry: () => void };

/** Figures, stamp and unresolved list for one briefing, from the same calculation the portfolio overview uses. */
export function useBriefingExtras(b: Briefing | null, resolve: (id: string) => BriefingItem): ExtrasState {
  const figures = useBriefingFigures(b?.scope ?? '', b?.snapshotId ?? '');
  const snapshots = useSnapshots();
  // A published briefing shows the figures frozen at publication, not today's recalculation.
  const f = b?.published?.figures ?? figures.data;
  const all = snapshots.data;
  const extras = b && f && all ? briefingExtras(b, f, all.find((s) => s.id === b.snapshotId), resolve) : null;
  return {
    extras,
    cells: b && f ? figureCells(f, b.audience) : null,
    loading: !extras && (figures.isLoading || snapshots.isLoading),
    error: figures.isError || snapshots.isError,
    retry: () => { void figures.refetch(); void snapshots.refetch(); },
  };
}
