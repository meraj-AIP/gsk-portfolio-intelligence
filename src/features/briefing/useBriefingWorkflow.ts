import { useSaveBriefing, useSetBriefingStatus } from '@/shared/api/hooks';
import type { Briefing, BriefingStatus } from '@/shared/types/domain';

/** Save and status moves against the revision the user loaded, so a concurrent save surfaces as a conflict. */
export function useBriefingWorkflow(draft: Briefing | null, setDraft: (b: Briefing) => void) {
  const save = useSaveBriefing();
  const status = useSetBriefingStatus();

  const saveDraft = async () => {
    if (!draft) return;
    status.reset();
    setDraft(await save.mutateAsync({ briefing: draft, expectedRevision: draft.revision }));
  };

  const move = async (to: BriefingStatus) => {
    if (!draft) return;
    save.reset();
    // Unsaved edits travel with the move; once out of draft or review the content is no longer editable.
    const editable = draft.status === 'draft' || draft.status === 'under review';
    const base = editable ? await save.mutateAsync({ briefing: draft, expectedRevision: draft.revision }) : draft;
    setDraft(await status.mutateAsync({ id: base.id, status: to }));
  };

  const error = save.error?.message ?? status.error?.message ?? '';
  return {
    saveDraft: () => void saveDraft().catch(() => undefined),
    move: (to: BriefingStatus) => void move(to).catch(() => undefined),
    busy: save.isPending || status.isPending,
    saved: save.isSuccess && !status.isPending,
    conflict: error.startsWith('Someone else saved'),
    error,
  };
}
