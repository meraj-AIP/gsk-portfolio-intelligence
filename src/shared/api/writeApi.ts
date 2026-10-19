import type { Action, Decision, Finding, OwnerResponse } from '@/shared/types/domain';
import type { Clarification } from '@/shared/types/workflow';
import { audit, authorise } from './audit';
import { fail, nextId, respond, store, today } from './store';

export type RespondInput = { findingId: string; expectedVersion: number; action: OwnerResponse['action']; note: string };

/** Records an owner response against a specific finding version. Version checks stop silent overwrites. */
export function respondToFinding(input: RespondInput): Promise<Finding> {
  const auth = authorise('respond to finding');
  if ('error' in auth) return fail(auth.error);
  const finding = store.findings.find((f) => f.id === input.findingId);
  if (!finding) return fail('Finding not found.');
  if (auth.user.role === 'Finance' && finding.category !== 'cost concern') return fail('Finance responds to cost findings only.');
  if (finding.version !== input.expectedVersion) {
    return fail(`The evidence behind this finding changed (now version ${finding.version}). Review the change before submitting.`);
  }
  const response: OwnerResponse = { id: nextId('RS', finding.responses), findingVersion: finding.version, reviewer: auth.user.name, date: today, action: input.action, note: input.note };
  finding.responses.push(response);
  audit(auth.user, { kind: 'owner response', targetId: finding.id, summary: `${input.action}: ${input.note}`, evidenceVersion: finding.version, inputs: { action: input.action, note: input.note } });
  return respond(finding);
}

export type RequestResponseInput = { findingId: string; owner: string; dueDate: string; note: string };

export function requestResponse(input: RequestResponseInput): Promise<Finding> {
  const auth = authorise('request response');
  if ('error' in auth) return fail(auth.error);
  const finding = store.findings.find((f) => f.id === input.findingId);
  if (!finding) return fail('Finding not found.');
  if (!input.owner.trim() || !input.dueDate) return fail('Name an owner and a due date.');
  finding.requestedOwner = input.owner.trim();
  finding.dueDate = input.dueDate;
  audit(auth.user, { kind: 'response requested', targetId: finding.id, summary: `Response requested from ${finding.requestedOwner} by ${input.dueDate}`, evidenceVersion: finding.version, inputs: { ...input } });
  return respond(finding);
}

export type ActionInput = { title: string; owner: string; dueDate: string; findingId?: string };

export function createAction(input: ActionInput): Promise<Action> {
  const auth = authorise('assign action');
  if ('error' in auth) return fail(auth.error);
  const action: Action = {
    id: nextId('A', store.actions), title: input.title, owner: input.owner, dueDate: input.dueDate, status: 'open', createdWeek: currentWeek(), version: 1,
    history: [{ date: today, note: 'Created from review.', by: auth.user.name }],
    ...(input.findingId ? { findingId: input.findingId } : {}),
  };
  store.actions.push(action);
  audit(auth.user, { kind: 'action created', targetId: action.id, summary: `${action.title} assigned to ${action.owner}`, inputs: { ...input } });
  return respond(action);
}

export type ActionUpdate = { id: string; expectedVersion: number; status?: Action['status']; blocker?: string; completionEvidence?: string; note?: string; owner?: string };

/** Owners update their own actions; only roles with "verify completion" can set verified complete. Reopening keeps history. */
export function updateAction(update: ActionUpdate): Promise<Action> {
  const auth = authorise();
  if ('error' in auth) return fail(auth.error);
  const action = store.actions.find((a) => a.id === update.id);
  if (!action) return fail('Action not found.');
  const isOwner = action.owner === auth.user.name;
  const verifying = update.status === 'verified complete';
  if (verifying && !['Portfolio lead', 'Sponsor'].includes(auth.user.role)) return fail(`The ${auth.user.role} role cannot verify completion.`);
  if (!verifying && !isOwner && auth.user.role !== 'Portfolio lead') return fail('Only the action owner or the portfolio lead can update this action.');
  if (action.version !== update.expectedVersion) return fail(`Someone else updated this action (now version ${action.version}). Reload it before saving.`);
  if (update.status) action.status = update.status;
  if (update.owner) action.owner = update.owner;
  if (update.blocker !== undefined) action.blocker = update.blocker;
  if (update.completionEvidence !== undefined) action.completionEvidence = update.completionEvidence;
  action.version += 1;
  const note = update.note ?? `Status set to ${action.status}.`;
  action.history.push({ date: today, note, by: auth.user.name });
  audit(auth.user, { kind: 'action updated', targetId: action.id, summary: note, inputs: Object.fromEntries(Object.entries(update).map(([k, v]) => [k, String(v)])) });
  return respond(action);
}

export type DecisionInput = { question: string; conclusion: string; conditions: string; reference: string; findingId?: string; actionIds: string[] };

export function recordDecision(input: DecisionInput): Promise<Decision> {
  const auth = authorise('record decision');
  if ('error' in auth) return fail(auth.error);
  if (!input.question.trim() || !input.conclusion.trim()) return fail('A decision needs the question and the conclusion.');
  const decision: Decision = {
    id: nextId('D', store.decisions), question: input.question.trim(), conclusion: input.conclusion.trim(), decisionMaker: auth.user.name, date: today,
    conditions: input.conditions.trim(), reference: input.reference.trim(), actionIds: input.actionIds, ...(input.findingId ? { findingId: input.findingId } : {}),
  };
  store.decisions.push(decision);
  audit(auth.user, { kind: 'decision recorded', targetId: decision.id, summary: decision.conclusion, inputs: { ...input, actionIds: input.actionIds.join(', ') } });
  return respond(decision);
}

export type ClarificationInput = { targetId: string; owner: string; question: string; dueDate: string };

/** A request to a named owner, not to the AI. Shows in the owner's My work and in Decisions and actions. */
export function requestClarification(input: ClarificationInput): Promise<Clarification> {
  const auth = authorise();
  if ('error' in auth) return fail(auth.error);
  if (!input.question.trim()) return fail('Say what needs clarifying.');
  const c: Clarification = { id: nextId('CL', store.clarifications), ...input, question: input.question.trim(), requestedBy: auth.user.name, requestedOn: today, status: 'open' };
  store.clarifications.push(c);
  audit(auth.user, { kind: 'clarification requested', targetId: input.targetId, summary: `Asked ${input.owner}: ${c.question}`, inputs: { ...input } });
  return respond(c);
}

export function answerClarification(id: string, answer: string): Promise<Clarification> {
  const auth = authorise();
  if ('error' in auth) return fail(auth.error);
  const c = store.clarifications.find((x) => x.id === id);
  if (!c) return fail('Request not found.');
  if (c.owner !== auth.user.name) return fail('Only the person asked can answer this request.');
  c.status = 'answered';
  c.answer = answer.trim();
  c.answeredOn = today;
  audit(auth.user, { kind: 'clarification answered', targetId: c.targetId, summary: c.answer, inputs: { id, answer } });
  return respond(c);
}

export type ConclusionInput = { itemId: string; week: string; text: string };

export function recordConclusion(input: ConclusionInput): Promise<boolean> {
  const auth = authorise();
  if ('error' in auth) return fail(auth.error);
  store.conclusions.push({ ...input, reviewer: auth.user.name, date: today });
  audit(auth.user, { kind: 'conclusion recorded', targetId: input.itemId, summary: input.text, inputs: { ...input } });
  return respond(true);
}

export function currentWeek(): string {
  return store.snapshots.find((s) => s.status === 'open')?.week ?? '2026-W41';
}
