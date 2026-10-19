import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as review from './reviewWriteApi';
import * as records from './recordsWriteApi';
import * as write from './writeApi';

/**
 * Every write changes the audit trail. Finding lifecycles, the assessment and briefing figures are derived from
 * actions, decisions and responses, so their roots (findings, snapshots, briefings) refresh with any write too.
 */
function useInvalidate(roots: string[]) {
  const qc = useQueryClient();
  return () => [...new Set([...roots, 'audit', 'findings', 'snapshots', 'briefings'])].forEach((k) => void qc.invalidateQueries({ queryKey: [k] }));
}

function useWrite<I, O>(fn: (input: I) => Promise<O>, roots: string[]) {
  const onSuccess = useInvalidate(roots);
  return useMutation({ mutationFn: fn, onSuccess });
}

export const useRespondToFinding = () => useWrite(write.respondToFinding, ['findings']);
export const useRequestResponse = () => useWrite(write.requestResponse, ['findings']);
export const useCreateAction = () => useWrite(write.createAction, ['actions']);
export const useUpdateAction = () => useWrite(write.updateAction, ['actions']);
export const useRecordDecision = () => useWrite(write.recordDecision, ['decisions']);
export const useRequestClarification = () => useWrite(write.requestClarification, ['clarifications']);
export const useAnswerClarification = () => useWrite((v: { id: string; answer: string }) => write.answerClarification(v.id, v.answer), ['clarifications']);
export const useRecordConclusion = () => useWrite(write.recordConclusion, ['conclusions']);

export const useCloseWeeklyReview = () => useWrite(review.closeWeeklyReview, ['snapshots', 'actions']);
export const useAmendSnapshot = () => useWrite(review.amendSnapshot, ['snapshots']);
export const useRefreshSnapshot = () => useWrite(() => review.refreshSnapshot(), ['pendingUpdate', 'findings', 'snapshots']);
export const useSaveBriefing = () => useWrite((v: { briefing: Parameters<typeof review.saveBriefing>[0]; expectedRevision: number }) => review.saveBriefing(v.briefing, v.expectedRevision), ['briefings']);
export const useSetBriefingStatus = () => useWrite((v: { id: string; status: Parameters<typeof review.setBriefingStatus>[1] }) => review.setBriefingStatus(v.id, v.status), ['briefings']);
export const useAddBriefingItems = () => useWrite((v: { id: string; sectionKey: string; itemIds: string[] }) => review.addBriefingItems(v.id, v.sectionKey, v.itemIds), ['briefings']);
export const useCreateBriefing = () => useWrite(review.createBriefing, ['briefings']);
export const useReviseBriefing = () => useWrite(review.reviseBriefing, ['briefings']);
export const useRecordBriefingExport = () => useWrite((v: { id: string; format: 'PowerPoint' | 'Teams' }) => review.recordBriefingExport(v.id, v.format), []);
export const useApplyDefinition = () => useWrite((v: { id: string; value: string; reason: string }) => review.applyDefinition(v.id, v.value, v.reason), ['definitions']);

export const useRetryIngestion = () => useWrite(records.retryIngestion, ['sources']);
export const useResolveSourceIssue = () => useWrite(records.resolveSourceIssue, ['sources']);
export const useRequestCorrection = () => useWrite((v: { sourceId: string; issueId: string; note: string }) => records.requestCorrection(v.sourceId, v.issueId, v.note), ['sources']);
export const useFlagInconsistency = () => useWrite((v: { evidenceId: string; note: string }) => records.flagInconsistency(v.evidenceId, v.note), ['sources']);
export const useRecordReleaseCondition = () => useWrite((v: { releaseId: string; condition: string; status: 'open' | 'met' }) => records.recordReleaseCondition(v.releaseId, v.condition, v.status), ['releases']);
export const useConfirmAllocation = () => useWrite((v: { costRecordId: string; basis: string }) => records.confirmAllocationBasis(v.costRecordId, v.basis), ['costs']);
export const useReconcileCost = () => useWrite((v: { costRecordId: string; note: string }) => records.reconcileCostRecord(v.costRecordId, v.note), ['costs']);
export const useSaveInvestigation = () => useWrite(records.saveInvestigationRun, ['investigations']);
export const useRouteInvestigation = () => useWrite((v: { investigationId: string; owner: string; dueDate: string }) => records.routeInvestigationToOwner(v.investigationId, v.owner, v.dueDate), ['investigations', 'findings']);
