import type { BriefingFigures } from '@/shared/lib/assessment';
import type { BriefingSection, Condition, Dimension, Project } from './domain';

export const ROLES = ['Portfolio lead', 'Sponsor', 'Project lead', 'Finance', 'Reporting or data owner'] as const;
export type Role = (typeof ROLES)[number];

/** Identity as the tenant would assert it. Scope lists narrow what a sponsor, lead or data owner works on. */
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  team: string;
  initials: string;
  programmeIds?: string[];
  projectIds?: string[];
  sourceIds?: string[];
};

export type AuditKind =
  | 'owner response' | 'response requested' | 'decision recorded' | 'action created' | 'action updated'
  | 'clarification requested' | 'clarification answered' | 'review closed' | 'snapshot amended' | 'conclusion recorded'
  | 'briefing saved' | 'briefing status' | 'briefing created' | 'briefing exported' | 'definition applied'
  | 'reconciliation decision' | 'mapping confirmed' | 'correction requested' | 'ingestion retried' | 'inconsistency flagged'
  | 'release condition' | 'allocation confirmed' | 'cost reconciled' | 'investigation run' | 'investigation routed' | 'snapshot refreshed';

/** One row per change. Inputs hold what the user supplied; evidenceVersion is the version they acted on. */
export type AuditEntry = {
  id: string;
  at: string;
  user: string;
  role: Role;
  kind: AuditKind;
  targetId: string;
  summary: string;
  evidenceVersion?: number;
  inputs: Record<string, string>;
};

export type Clarification = {
  id: string;
  targetId: string;
  owner: string;
  question: string;
  requestedBy: string;
  requestedOn: string;
  dueDate: string;
  status: 'open' | 'answered';
  answer?: string;
  answeredOn?: string;
};

/** What a review knew when it was closed. Read-only once frozen. */
export type SnapshotContent = {
  positions: Record<string, Record<Dimension, Condition>>;
  freshness: Record<string, Project['freshness']>;
  commitmentDates: Record<string, string>;
  findings: { id: string; title: string; version: number; currentPosition: string }[];
  definitionVersions: Record<string, number>;
  frozenAt: string;
  frozenBy: string;
};

export type Amendment = { id: string; date: string; by: string; recordId: string; correction: string; reason: string };

export type DefinitionVersion = { version: number; value: string; owner: string; effectiveDate: string; reason: string };

export type DefinitionPreview = { definitionId: string; calculated: boolean; summary: string; before: number; after: number; changedIds: string[] };

export type TechnicalIssue = {
  id: string;
  projectId: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'mitigated' | 'resolved';
  raised: string;
  owner: string;
  affectedCommitmentIds: string[];
  deliveryEffect: string;
  evidenceId: string;
};

export type ResourceConstraint = {
  id: string;
  projectId: string;
  requiredTeamOrSkill: string;
  affectedCommitmentId: string;
  responsibleOwner: string;
  neededBy: string;
  status: 'open' | 'filled';
  note: string;
};

export type BusinessCapability = { id: string; name: string; intendedUsers: string; projectIds: string[]; releaseIds: string[] };

export type InvestigationRecord = {
  id: string;
  question: string;
  contextIds: string[];
  period: string;
  requestedBy: string;
  role: Role;
  startedAt: string;
  finishedAt?: string;
  state: 'completed' | 'failed' | 'cancelled' | 'awaiting clarification' | 'timed out';
  answer?: string;
  method?: string;
  evidenceIds: string[];
  uncertainties: string[];
  proposedResponse?: string;
  routedTo?: string;
  findingId?: string;
};

/** figures are frozen at publication so a published briefing never drifts from what was sent. */
export type PublishedBriefing = { sections: BriefingSection[]; definitionVersions: Record<string, number>; publishedAt: string; publishedBy: string; figures?: BriefingFigures };
