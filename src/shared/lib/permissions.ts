import type { Role, User } from '@/shared/types/workflow';

/** Every gated operation in the workspace. Names read as "can the user ...". */
export type Capability =
  | 'request response' | 'close review' | 'amend snapshot' | 'prepare briefing' | 'add to briefing' | 'publish briefing'
  | 'apply definition' | 'record reconciliation' | 'verify completion' | 'record decision' | 'respond to finding'
  | 'update own action' | 'assign action' | 'record release condition' | 'confirm allocation' | 'reconcile cost'
  | 'confirm mapping' | 'request correction' | 'retry ingestion' | 'view all sources' | 'refresh snapshot';

/** Straight from the PRD role table. The "cannot" column is the absence of a capability here. */
const GRANTS: Record<Role, Capability[]> = {
  'Portfolio lead': [
    'request response', 'close review', 'amend snapshot', 'prepare briefing', 'add to briefing', 'publish briefing', 'apply definition',
    'record reconciliation', 'verify completion', 'assign action', 'respond to finding', 'update own action', 'confirm mapping', 'view all sources', 'refresh snapshot',
  ],
  Sponsor: ['record decision', 'verify completion', 'add to briefing', 'respond to finding', 'update own action', 'assign action', 'refresh snapshot'],
  'Project lead': ['respond to finding', 'update own action', 'record release condition', 'refresh snapshot'],
  Finance: ['confirm allocation', 'reconcile cost', 'respond to finding', 'update own action', 'record reconciliation', 'refresh snapshot'],
  'Reporting or data owner': ['confirm mapping', 'request correction', 'retry ingestion', 'record reconciliation', 'update own action'],
};

export function can(user: Pick<User, 'role'> | null | undefined, capability: Capability): boolean {
  return Boolean(user && GRANTS[user.role].includes(capability));
}

export function denialMessage(role: Role, capability: Capability): string {
  return `The ${role} role cannot ${capability}.`;
}

/** Data owners see only the sources they own; everyone with the portfolio-wide grant sees all. */
export function canSeeSource(user: User | null | undefined, sourceId: string): boolean {
  if (!user) return false;
  if (can(user, 'view all sources') || user.role !== 'Reporting or data owner') return true;
  return (user.sourceIds ?? []).includes(sourceId);
}

/** Where each role lands after sign-in (PRD, Users and roles). */
export function landingPath(user: User): string {
  if (user.role === 'Sponsor' && user.programmeIds?.[0]) return `/programmes/${user.programmeIds[0]}`;
  if (user.role === 'Project lead' && user.projectIds?.[0]) return `/projects/${user.projectIds[0]}`;
  if (user.role === 'Finance') return '/compare?focus=cost';
  if (user.role === 'Reporting or data owner') return '/sources';
  return '/portfolio';
}
