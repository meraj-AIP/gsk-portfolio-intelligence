import { useState } from 'react';
import { useActionPage } from '@/shared/api/hooks';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import type { Action } from '@/shared/types/domain';
import { ActionUpdateDialog } from './ActionUpdateDialog';
import { ActionsTable } from './ActionsTable';
import { MatrixCard, MatrixMessage } from '@/shared/components/ui/MatrixCard';
import { Pager, useListParams } from './viewState';

const SUBTITLE = 'Assignment, progress, blockers and completion evidence. Owner reported completion is not verified completion.';

export function ActionsView() {
  const { mine, params, setPage } = useListParams();
  const query = useActionPage(params);
  const [editing, setEditing] = useState<Action | null>(null);
  const data = query.data;
  // Prefer the refetched row so a conflict reload hands the dialog the latest version.
  const current = editing ? data?.items.find((a) => a.id === editing.id) ?? editing : null;
  return (
    <MatrixCard title="Actions" subtitle={SUBTITLE} footer={data?.total ? <Pager data={data} onPage={setPage} noun="actions" /> : undefined}>
      {query.isError ? <MatrixMessage><ErrorState message={query.error.message} onRetry={() => void query.refetch()} /></MatrixMessage>
        : !data ? <MatrixMessage><LoadingState rows={5} /></MatrixMessage>
          : data.items.length ? <ActionsTable actions={data.items} onUpdate={setEditing} />
            : <MatrixMessage><EmptyState title={mine ? 'No actions assigned to you' : 'No actions in this scope'} hint={mine ? 'Switch to everyone to see the whole portfolio.' : undefined} /></MatrixMessage>}
      {current ? <ActionUpdateDialog key={current.id} action={current} onClose={() => setEditing(null)} /> : null}
    </MatrixCard>
  );
}
