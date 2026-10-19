import { can, denialMessage, type Capability } from '@/shared/lib/permissions';
import type { AuditEntry, AuditKind, User } from '@/shared/types/workflow';
import { getActor } from './session';
import { nextId, store } from './store';

let clock = 0;

/** Timestamps stay on the demo's review day but keep their order. */
function stamp(): string {
  clock += 1;
  const mins = 9 * 60 + clock;
  return `2026-10-12 ${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

/** Returns the acting user, or an error message when no one is signed in or the role lacks the capability. */
export function authorise(capability?: Capability): { user: User } | { error: string } {
  const user = getActor();
  if (!user) return { error: 'Your session has ended. Sign in again.' };
  if (capability && !can(user, capability)) return { error: denialMessage(user.role, capability) };
  return { user };
}

type RecordInput = { kind: AuditKind; targetId: string; summary: string; inputs?: Record<string, string>; evidenceVersion?: number };

export function audit(user: User, entry: RecordInput): AuditEntry {
  const row: AuditEntry = {
    id: nextId('AU', store.audit), at: stamp(), user: user.name, role: user.role, kind: entry.kind, targetId: entry.targetId,
    summary: entry.summary, inputs: entry.inputs ?? {}, ...(entry.evidenceVersion !== undefined ? { evidenceVersion: entry.evidenceVersion } : {}),
  };
  store.audit.push(row);
  return row;
}
