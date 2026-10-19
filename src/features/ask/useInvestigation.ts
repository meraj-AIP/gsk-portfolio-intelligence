import { useCallback, useRef, useState } from 'react';
import { useSaveInvestigation } from '@/shared/api/hooks';
import { runInvestigation, type InvestigationInput, type InvestigationResult } from '@/shared/api/investigationApi';
import type { InvestigationRecord } from '@/shared/types/workflow';

/** The PRD execution limit. A run that exceeds it is recorded as timed out, not left spinning. */
export const TIME_LIMIT_MS = 60_000;

export type LiveState = 'queued' | 'retrieving' | 'analysing' | 'saving';
export type LiveRun = { id: number; input: InvestigationInput; state: LiveState; startedAt: string; saveError?: string };
type Terminal = Omit<InvestigationRecord, 'id' | 'requestedBy' | 'role'>;

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function withLimit(p: Promise<InvestigationResult>): Promise<InvestigationResult | 'timed out'> {
  let timer = 0;
  const limit = new Promise<'timed out'>((r) => { timer = window.setTimeout(() => r('timed out'), TIME_LIMIT_MS); });
  return Promise.race([p, limit]).finally(() => window.clearTimeout(timer));
}

function toRecord(input: InvestigationInput, startedAt: string, outcome: InvestigationResult | 'timed out' | 'cancelled' | Error): Terminal {
  const base = { question: input.question, contextIds: input.contextIds, period: input.period, startedAt, finishedAt: new Date().toISOString(), evidenceIds: [], uncertainties: [] };
  if (outcome === 'timed out') return { ...base, state: 'timed out', answer: `Stopped after the ${TIME_LIMIT_MS / 1000} second execution limit. Narrow the scope and try again.` };
  if (outcome === 'cancelled') return { ...base, state: 'cancelled' };
  if (outcome instanceof Error) return { ...base, state: 'failed', answer: outcome.message };
  if (outcome.needsClarification) return { ...base, state: 'awaiting clarification', answer: outcome.needsClarification };
  return { ...base, state: 'completed', answer: outcome.answer, method: outcome.method, evidenceIds: outcome.evidenceIds, uncertainties: outcome.uncertainties, ...(outcome.proposedResponse ? { proposedResponse: outcome.proposedResponse } : {}) };
}

/**
 * Drives runs through visible states and persists every terminal outcome, so history survives navigation.
 * A run leaves the live list once saved; the saved record then comes back through useInvestigations.
 */
export function useInvestigation() {
  const { mutateAsync: saveRun } = useSaveInvestigation();
  const [runs, setRuns] = useState<LiveRun[]>([]);
  const counter = useRef(0);
  const cancelled = useRef<Set<number>>(new Set());

  const patch = (id: number, p: Partial<LiveRun>) => setRuns((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const finish = useCallback(async (run: Pick<LiveRun, 'id' | 'input' | 'startedAt'>, outcome: Parameters<typeof toRecord>[2]) => {
    patch(run.id, { state: 'saving' });
    try {
      await saveRun(toRecord(run.input, run.startedAt, outcome));
      setRuns((rs) => rs.filter((r) => r.id !== run.id));
    } catch (e) {
      patch(run.id, { saveError: e instanceof Error ? e.message : 'The run could not be saved.' });
    }
  }, [saveRun]);

  const start = useCallback(async (input: InvestigationInput) => {
    const run = { id: ++counter.current, input, startedAt: new Date().toISOString() };
    setRuns((rs) => [{ ...run, state: 'queued' }, ...rs]);
    await wait(300);
    if (cancelled.current.has(run.id)) return;
    patch(run.id, { state: 'retrieving' });
    await wait(500);
    if (cancelled.current.has(run.id)) return;
    patch(run.id, { state: 'analysing' });
    let outcome: Parameters<typeof toRecord>[2];
    try {
      outcome = await withLimit(runInvestigation(input));
    } catch (e) {
      outcome = e instanceof Error ? e : new Error('Unknown error');
    }
    if (!cancelled.current.has(run.id)) await finish(run, outcome);
  }, [finish]);

  const cancel = useCallback((run: LiveRun) => {
    cancelled.current.add(run.id);
    void finish(run, 'cancelled');
  }, [finish]);

  return { runs, start, cancel };
}
