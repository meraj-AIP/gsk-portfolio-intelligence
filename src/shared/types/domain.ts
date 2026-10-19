export const CONDITIONS = ['met', 'attention', 'breached', 'reported', 'unknown'] as const;
export type Condition = (typeof CONDITIONS)[number];

export const DIMENSIONS = ['delivery', 'releases', 'dependencies', 'cost', 'outcomes'] as const;
export type Dimension = (typeof DIMENSIONS)[number];

export const STAGES = ['Idea', 'Scoping', 'Build', 'Vetting', 'Live', 'Scaling', 'Paused'] as const;
export type Stage = (typeof STAGES)[number];

export type FundingShare = { businessUnit: string; percent: number };

export type GovernanceGate = {
  name: string;
  status: 'passed' | 'pending' | 'not started' | 'returned';
  date?: string;
  owner: string;
};

export type Programme = {
  id: string;
  name: string;
  objective: string;
  sponsor: string;
  lead: string;
  businessArea: string;
  funding: FundingShare[];
  reportingDate: string;
  assessment: string;
  nextDecision: string;
};

export type Project = {
  id: string;
  programmeId: string;
  name: string;
  purpose: string;
  owner: string;
  businessArea: string;
  stage: Stage;
  position: Record<Dimension, Condition>;
  commitment: { original: string; current: string; actual?: string; label: string };
  reportingDate: string;
  freshness: 'current' | 'stale' | 'missing';
  gates: GovernanceGate[];
  outstandingResponse?: string;
  funding: FundingShare[];
};

export type Commitment = {
  id: string;
  projectId: string;
  title: string;
  baselineDate: string;
  currentDate: string;
  actualDate?: string;
  owner: string;
  status: 'completed' | 'on track' | 'revised' | 'late' | 'carried forward';
  evidenceId: string;
  week: string;
  /** Date the platform received the record; differs from the event date for late arrivals. */
  receivedDate?: string;
  revisions?: { date: string; from: string; to: string; reason: string }[];
};

export type ScopeChange = {
  id: string;
  projectId: string;
  date: string;
  added: string;
  removed: string;
  revised: string;
  ownerReportedEffect: string;
  evidenceId: string;
};

export type ReleaseEvent = {
  kind: 'planned' | 'deployed' | 'available' | 'expanded' | 'withdrawn';
  date: string;
  note: string;
};

export type Release = {
  id: string;
  projectId: string;
  capability: string;
  owner: string;
  businessCapability: string;
  events: ReleaseEvent[];
  enabledTeams: string[];
  outstandingConditions: string[];
  adoption?: { period: string; activeUsers: number; note: string; early: boolean };
  changesFromPrevious: string;
  previousReleaseId?: string;
  evidenceId: string;
  week: string;
  receivedDate?: string;
  conditionLog?: { condition: string; recordedBy: string; date: string; status: 'open' | 'met' }[];
};

export const DEPENDENCY_TYPES = [
  'requires an input',
  'delivers a capability',
  'depends on a team commitment',
  'shares a service',
  'contributes to an outcome',
] as const;
export type DependencyType = (typeof DEPENDENCY_TYPES)[number];

export type NodeKind = 'programme' | 'project' | 'dataset' | 'model' | 'team' | 'service' | 'outcome';
export type GraphNode = { id: string; label: string; kind: NodeKind; owner?: string };

export type Dependency = {
  id: string;
  type: DependencyType;
  fromId: string;
  toId: string;
  description: string;
  owner: string;
  requiredDate: string;
  position: Condition;
  actualImpact: string;
  ownerReportedImpact: string;
  aiInferredExposure: string;
  affectedCommitmentIds: string[];
  evidenceId: string;
  reuseCandidate?: boolean;
};

export type CostRecord = {
  id: string;
  projectId: string;
  period: string;
  amount: number;
  currency: 'GBP';
  kind: 'budget' | 'actual' | 'forecast';
  fundedBy: string;
  allocationBasis: string;
  allocationConfirmed?: { by: string; date: string };
  reconciliation?: { by: string; date: string; note: string };
};

export type OutcomeMeasure = {
  id: string;
  projectId: string;
  name: string;
  definition: string;
  baseline: string;
  forecast: string;
  actual?: string;
  kind: 'forecast benefit' | 'measured outcome' | 'released capacity' | 'cash saving';
  owner: string;
  period: string;
  evidenceId: string;
  population?: string;
  attribution?: string;
};

export type StatementType = 'reported fact' | 'calculated result' | 'AI interpretation';
export type FindingCategory = 'decision needed' | 'delayed commitment' | 'release issue' | 'cost concern' | 'missing information' | 'governance';

export type OwnerResponse = {
  id: string;
  findingVersion: number;
  reviewer: string;
  date: string;
  action: 'confirmed' | 'revised' | 'challenged' | 'clarification requested' | 'action assigned';
  note: string;
};

export type Finding = {
  id: string;
  title: string;
  category: FindingCategory;
  statementType: StatementType;
  affectedIds: string[];
  previousPosition: string;
  currentPosition: string;
  significance: string;
  evidenceIds: string[];
  unknowns: string;
  version: number;
  firstSeenWeek: string;
  persistent: boolean;
  responses: OwnerResponse[];
  requestedOwner?: string;
  dueDate?: string;
  nextAction?: string;
  /** Calculated results carry how they were produced. */
  calculation?: { method: string; inputs: string[] };
  /** Earlier versions, newest last, so a stale draft can be compared with what changed. */
  versions?: { version: number; date: string; currentPosition: string; significance: string }[];
};

export type EvidenceType = 'project update' | 'plan or commitment' | 'release record' | 'financial record' | 'business measure' | 'calculation' | 'decision';

export type Evidence = {
  id: string;
  type: EvidenceType;
  source: string;
  date: string;
  version: number;
  owner: string;
  excerpt: string;
  context: string;
  fields: Record<string, string>;
  previousFields?: Record<string, string>;
  originalAvailable: boolean;
  stale?: boolean;
  eventDate?: string;
  ingestedAt?: string;
  permission?: 'permitted' | 'restricted';
  anchor?: { label: string; status: 'resolved' | 'broken' };
  history?: { version: number; date: string; fields: Record<string, string> }[];
};

export type Decision = {
  id: string;
  question: string;
  conclusion: string;
  decisionMaker: string;
  date: string;
  conditions: string;
  reference: string;
  findingId?: string;
  actionIds: string[];
};

export type Action = {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: 'open' | 'in progress' | 'blocked' | 'reported complete' | 'verified complete';
  blocker?: string;
  completionEvidence?: string;
  findingId?: string;
  createdWeek: string;
  history: { date: string; note: string; by?: string }[];
  version: number;
};

export type Page<T> = { items: T[]; total: number; page: number; pageSize: number };

export * from './governance';
