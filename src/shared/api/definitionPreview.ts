import type { DefinitionPreview } from '@/shared/types/workflow';
import { respond, store, today } from './store';

const firstNumber = (text: string): number | null => {
  const m = /(\d+(?:\.\d+)?)/.exec(text);
  return m ? Number(m[1]) : null;
};

/** Working days between two ISO dates, Monday to Friday, ignoring holidays. */
export function workingDaysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  const sign = to >= from ? 1 : -1;
  let days = 0;
  for (let t = Math.min(from, to); t < Math.max(from, to); t += 86_400_000) {
    const d = new Date(t).getUTCDay();
    if (d !== 0 && d !== 6) days += 1;
  }
  return days * sign;
}

const delayedIds = (threshold: number) => store.commitments
  .filter((c) => workingDaysBetween(c.baselineDate, c.currentDate) > threshold || (!c.actualDate && c.currentDate < today))
  .map((c) => c.id);

const breachedIds = (threshold: number) => store.commitments
  .filter((c) => !c.actualDate && workingDaysBetween(c.baselineDate, today) > threshold)
  .map((c) => c.id);

const varianceIds = (percent: number) => store.projects.filter((p) => {
  const sum = (kind: string) => store.costRecords.filter((k) => k.projectId === p.id && k.kind === kind && k.allocationBasis === 'Direct').reduce((a, k) => a + k.amount, 0);
  const budget = sum('budget');
  return budget > 0 && (Math.abs(sum('forecast') - budget) / budget) * 100 > percent;
}).map((p) => p.id);

const RULES: Record<string, { label: string; ids: (n: number) => string[] }> = {
  'DEF-02': { label: 'commitments classed as delayed', ids: delayedIds },
  'DEF-03': { label: 'commitments classed as breached', ids: breachedIds },
  'DEF-09': { label: 'projects with a material cost variance', ids: varianceIds },
};

/** Recalculates the affected records under the current and the proposed wording, against the open review's data. */
export function previewDefinitionChange(id: string, proposed: string): Promise<DefinitionPreview> {
  const def = store.definitions.find((d) => d.id === id);
  const rule = RULES[id];
  const oldN = def ? firstNumber(def.value) : null;
  const newN = firstNumber(proposed);
  if (!def || !rule || oldN === null || newN === null) {
    return respond({
      definitionId: id, calculated: false, before: 0, after: 0, changedIds: [],
      summary: `No calculated preview for this definition. It changes: ${def?.affects.join(', ') ?? 'unknown'}. Review those views after applying.`,
    }, 300);
  }
  const before = rule.ids(oldN);
  const after = rule.ids(newN);
  const changedIds = [...after.filter((x) => !before.includes(x)), ...before.filter((x) => !after.includes(x))];
  return respond({
    definitionId: id, calculated: true, before: before.length, after: after.length, changedIds,
    summary: `Threshold ${oldN} to ${newN}: ${before.length} to ${after.length} ${rule.label} in the open review.`,
  }, 400);
}
