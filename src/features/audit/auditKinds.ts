import type { AuditKind } from '@/shared/types/workflow';

/** Runtime list for the filter; `satisfies` keeps it in step with the AuditKind union. */
export const AUDIT_KINDS = [
  'owner response', 'response requested', 'decision recorded', 'action created', 'action updated',
  'clarification requested', 'clarification answered', 'review closed', 'snapshot amended', 'conclusion recorded',
  'briefing saved', 'briefing status', 'briefing created', 'briefing exported', 'definition applied',
  'reconciliation decision', 'mapping confirmed', 'correction requested', 'ingestion retried', 'inconsistency flagged',
  'release condition', 'allocation confirmed', 'cost reconciled', 'investigation run', 'investigation routed', 'snapshot refreshed',
] as const satisfies readonly AuditKind[];
