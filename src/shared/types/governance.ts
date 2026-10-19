import type { Amendment, DefinitionVersion, PublishedBriefing, SnapshotContent } from './workflow';

export type Source = {
  id: string;
  name: string;
  supplies: string;
  owner: string;
  authoritativeFields: string[];
  cadence: string;
  lastRefresh: string;
  connectionHealth: 'healthy' | 'degraded' | 'failed';
  contentQuality: 'good' | 'gaps' | 'conflicts';
  issues: SourceIssue[];
};

export type SourceIssue = {
  id: string;
  kind?: 'gap' | 'conflict' | 'mapping' | 'failure' | 'flag';
  description: string;
  affectedRecords: string[];
  conflictingValues?: string;
  fieldAuthority?: string;
  raised?: string;
  reconciliationOwner: string;
  downstream: string[];
  status?: 'open' | 'correction requested' | 'resolved';
  resolution?: { decision: string; by: string; date: string };
};

export type Definition = {
  id: string;
  area: string;
  name: string;
  value: string;
  version: number;
  owner: string;
  effectiveDate: string;
  reason: string;
  affects: string[];
  history?: DefinitionVersion[];
};

export type Snapshot = {
  id: string;
  label: string;
  date: string;
  week: string;
  status: 'open' | 'closed' | 'amended';
  content?: SnapshotContent;
  amendments?: Amendment[];
};

export type BriefingStatus = 'draft' | 'under review' | 'approved' | 'published' | 'superseded';
export type BriefingSection = { key: string; title: string; narrative: string; itemIds: string[] };
export type Briefing = {
  id: string;
  audience: string;
  scope: string;
  period: string;
  snapshotId: string;
  status: BriefingStatus;
  version: number;
  sections: BriefingSection[];
  updatedAt: string;
  /** Edit counter for concurrency checks; version counts publications. */
  revision: number;
  templateId?: string;
  published?: PublishedBriefing;
};
