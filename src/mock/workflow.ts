import type { Condition, Dimension } from '@/shared/types/domain';
import type { BusinessCapability, ResourceConstraint, TechnicalIssue } from '@/shared/types/workflow';

export const technicalIssues: TechnicalIssue[] = [
  { id: 'TI-01', projectId: 'P-102', title: 'Manual enrolment sheet drifts from the clinical data lake extract', severity: 'high', status: 'open', raised: '2026-09-30', owner: 'Ben Okafor', affectedCommitmentIds: ['C-03'], deliveryEffect: 'Rankings for Study 4 need a manual reconciliation pass each week.', evidenceId: 'E-02' },
  { id: 'TI-02', projectId: 'P-202', title: 'Drafted responses do not cite the approved standard response ID', severity: 'high', status: 'mitigated', raised: '2026-10-06', owner: 'Dr Rachel Lindqvist', affectedCommitmentIds: ['C-08'], deliveryEffect: 'Template rework before resubmission to promotional review.', evidenceId: 'E-06' },
  { id: 'TI-03', projectId: 'P-302', title: 'Tender feed latency above 48 hours for two markets', severity: 'medium', status: 'open', raised: '2026-10-02', owner: 'Helen Osei', affectedCommitmentIds: ['C-11'], deliveryEffect: 'Parallel run compares against a stale tender pipeline in Spain and Italy.', evidenceId: 'E-09' },
  { id: 'TI-04', projectId: 'P-401', title: 'Model registry nightly sync failing', severity: 'medium', status: 'open', raised: '2026-10-12', owner: 'Devon Carlisle', affectedCommitmentIds: ['C-16'], deliveryEffect: 'Model nodes in the dependency view show the 11 Oct state.', evidenceId: 'E-11' },
  { id: 'TI-05', projectId: 'P-101', title: 'Statistical section template v6 references retired', severity: 'low', status: 'resolved', raised: '2026-09-22', owner: 'Anjali Mehra', affectedCommitmentIds: ['C-01'], deliveryEffect: 'None after release 1.3.', evidenceId: 'E-01' },
];

export const resourceConstraints: ResourceConstraint[] = [
  { id: 'RC-01', projectId: 'P-402', requiredTeamOrSkill: 'Second AI governance reviewer', affectedCommitmentId: 'C-14', responsibleOwner: 'Chief Data and AI Officer', neededBy: '2026-10-31', status: 'open', note: 'Funding decision due 17 Oct (A-02).' },
  { id: 'RC-02', projectId: 'P-303', requiredTeamOrSkill: 'Deputy owner while Nadia Rahman is on leave', affectedCommitmentId: 'C-12', responsibleOwner: 'Marta Kowalczyk', neededBy: '2026-10-13', status: 'open', note: 'No weekly update until a deputy is named.' },
  { id: 'RC-03', projectId: 'P-102', requiredTeamOrSkill: 'Data Platform engineer for the access workaround', affectedCommitmentId: 'C-04', responsibleOwner: 'Data Platform Team', neededBy: '2026-10-16', status: 'open', note: 'Shared with Safety Signal Triage from 1 Nov.' },
  { id: 'RC-04', projectId: 'P-201', requiredTeamOrSkill: 'Veeva integration specialist', affectedCommitmentId: 'C-07', responsibleOwner: 'Sarah Whitfield', neededBy: '2026-10-20', status: 'filled', note: 'Contractor started 6 Oct.' },
];

export const businessCapabilities: BusinessCapability[] = [
  { id: 'BC-01', name: 'Protocol authoring', intendedUsers: 'Clinical writers, Oncology and Vaccines TAs', projectIds: ['P-101'], releaseIds: ['R-01', 'R-08'] },
  { id: 'BC-02', name: 'Field pre-call preparation', intendedUsers: 'UK and Germany field representatives', projectIds: ['P-201'], releaseIds: ['R-02'] },
  { id: 'BC-03', name: 'Deviation investigation', intendedUsers: 'Site QA investigators', projectIds: ['P-301', 'P-303'], releaseIds: ['R-03'] },
  { id: 'BC-04', name: 'Medical information response', intendedUsers: 'EU medical information teams', projectIds: ['P-202'], releaseIds: ['R-04'] },
  { id: 'BC-05', name: 'Agent build patterns', intendedUsers: 'Agent builders across business units', projectIds: ['P-402', 'P-403'], releaseIds: ['R-05'] },
  { id: 'BC-06', name: 'Portfolio context', intendedUsers: 'Portfolio office and finance partners', projectIds: ['P-401'], releaseIds: ['R-06'] },
  { id: 'BC-07', name: 'Demand planning', intendedUsers: 'Europe demand planners', projectIds: ['P-302'], releaseIds: ['R-07'] },
];

/** Cells that differed in earlier reviews. Everything else matched the week 41 position. */
export const pastPositions: Record<string, Record<string, Partial<Record<Dimension, Condition>>>> = {
  'SNAP-W38': {
    'P-102': { delivery: 'attention', dependencies: 'attention' }, 'P-201': { releases: 'reported', outcomes: 'unknown' },
    'P-302': { cost: 'met', delivery: 'met' }, 'P-301': { outcomes: 'reported' }, 'P-402': { delivery: 'met' }, 'P-202': { delivery: 'met', releases: 'met' },
  },
  'SNAP-W39': {
    'P-102': { delivery: 'attention', dependencies: 'breached' }, 'P-201': { releases: 'reported', outcomes: 'unknown' },
    'P-302': { cost: 'met' }, 'P-301': { outcomes: 'reported' }, 'P-402': { delivery: 'met' }, 'P-202': { releases: 'met' },
  },
  'SNAP-W40': {
    'P-201': { releases: 'reported', outcomes: 'unknown' }, 'P-302': { cost: 'attention' }, 'P-301': { outcomes: 'reported' }, 'P-202': { releases: 'met' },
  },
};

export const pastFreshness: Record<string, Record<string, 'current' | 'stale' | 'missing'>> = {
  'SNAP-W40': { 'P-303': 'current' },
  'SNAP-W39': { 'P-303': 'current' },
  'SNAP-W38': { 'P-303': 'current' },
};

export const commitmentEnrichment: Record<string, { receivedDate?: string; revisions?: { date: string; from: string; to: string; reason: string }[] }> = {
  'C-03': { revisions: [{ date: '2026-09-18', from: '2026-09-25', to: '2026-10-09', reason: 'Data lake access not granted.' }, { date: '2026-10-02', from: '2026-10-09', to: '2026-10-23', reason: 'Workaround slower than planned.' }] },
  'C-08': { revisions: [{ date: '2026-10-06', from: '2026-10-02', to: '2026-10-16', reason: 'Returned by promotional review.' }] },
  'C-11': { revisions: [{ date: '2026-10-03', from: '2026-10-16', to: '2026-10-30', reason: 'Eight-week parallel run requested by Quality.' }], receivedDate: '2026-10-11' },
  'C-14': { revisions: [{ date: '2026-09-29', from: '2026-09-30', to: '2026-10-31', reason: 'Backlog rose; second reviewer not funded.' }] },
  'C-10': { receivedDate: '2026-10-10' },
};

export const releaseReceived: Record<string, string> = { 'R-03': '2026-10-10', 'R-07': '2026-10-11' };

export const outcomeEnrichment: Record<string, { population: string; attribution: string }> = {
  'OM-01': { population: 'Oncology TA studies with synopsis approved after 1 Sep', attribution: 'Protocol Drafting Assistant only' },
  'OM-02': { population: 'Clinical writers using release 1.3', attribution: 'Protocol Drafting Assistant only' },
  'OM-03': { population: 'UK pilot cohort, 120 reps', attribution: 'HCP Engagement Copilot; shared with field coaching programme' },
  'OM-04': { population: 'EU medical information requests', attribution: 'Medical Information Response Agent only' },
  'OM-05': { population: 'Deviations raised at Barnard Castle', attribution: 'Deviation Investigation Assistant; site process changes also contribute' },
  'OM-06': { population: 'Enabled sites', attribution: 'Deviation Investigation Assistant only' },
  'OM-07': { population: 'Europe SKUs in parallel run', attribution: 'Demand Sensing Agent only' },
  'OM-08': { population: 'Agents built on pattern v3 or later', attribution: 'Pattern library and vetting service jointly' },
  'OM-09': { population: 'Solutions with complete intake', attribution: 'Vetting service only' },
};

export const findingEnrichment: Record<string, { nextAction?: string; calculation?: { method: string; inputs: string[] } }> = {
  'F-01': { nextAction: 'Sponsor decision on interim read access or acceptance of a four-week slip (A-01).' },
  'F-02': { nextAction: 'Second reviewer funding decision by 17 Oct (A-02).', calculation: { method: 'Count of solutions in the governance intake tracker with status "awaiting review" on the snapshot date; turnaround is the mean of working days from intake complete to board decision for September decisions.', inputs: ['E-12 governance intake tracker v5', 'E-18 leadership decision 29 Sep', 'DEF-09 materiality'] } },
  'F-03': { nextAction: 'Scope options from the project owner by 16 Oct (A-04).', calculation: { method: 'Forecast minus direct budget for FY26, divided by direct budget. Shared allocations excluded (DEF-06).', inputs: ['K-23 budget £390k', 'K-25 forecast £460k', 'E-09 finance export v2', 'DEF-06 v2'] } },
  'F-04': { nextAction: 'Template rework and resubmission (A-03).' },
  'F-05': { nextAction: 'Name a deputy owner and submit the week 41 update (A-05).' },
  'F-06': { nextAction: 'Owner to confirm whether the Germany cohort date holds.' },
  'F-07': { nextAction: 'Manufacturing IT to assess field coverage of the P-301 connection.' },
  'F-08': { nextAction: 'Measurement owner to confirm when the window opens.' },
  'F-10': { nextAction: 'Finance to confirm the allocation basis (A-08).' },
};

export const evidenceEnrichment: Record<string, { eventDate?: string; ingestedAt: string; permission?: 'permitted' | 'restricted'; anchor?: { label: string; status: 'resolved' | 'broken' } }> = {
  'E-03': { ingestedAt: '2026-09-03 07:10', permission: 'restricted', anchor: { label: 'DPR-2291 approval history', status: 'resolved' } },
  'E-06': { ingestedAt: '2026-10-07 09:00', anchor: { label: 'Minutes, item 4', status: 'broken' } },
  'E-09': { ingestedAt: '2026-10-09 06:00', anchor: { label: 'Cost centre 4412, row 18', status: 'resolved' } },
  'E-10': { ingestedAt: '2026-10-02 17:12', anchor: { label: 'Register row P-303, week 40', status: 'resolved' } },
  'E-15': { eventDate: '2026-09-30', ingestedAt: '2026-10-03 11:20', anchor: { label: 'Site QA dashboard, September', status: 'resolved' } },
  'E-17': { ingestedAt: '2026-10-12 06:30', anchor: { label: 'Roll-up W41', status: 'resolved' } },
};

/** How persistent findings read in earlier reviews, so the week-by-week trail shows how each one developed. */
export const pastFindingPositions: Record<string, Record<string, string>> = {
  'SNAP-W38': { 'F-01': 'Access request pending since 2 Sep; commitment 25 Sep at risk' },
  'SNAP-W39': { 'F-01': 'No access decision; commitment moved to 9 Oct', 'F-08': 'Forecast; release 1.2 live in one therapy area' },
  'SNAP-W40': { 'F-01': 'No decision recorded; commitment moved to 23 Oct', 'F-02': 'Backlog 3; turnaround 12 days', 'F-08': 'Forecast; measurement window opens after three studies complete' },
};
