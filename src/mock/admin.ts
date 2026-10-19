import type { Briefing, Definition, Snapshot, Source } from '@/shared/types/domain';

export const snapshots: Snapshot[] = [
  { id: 'SNAP-W38', week: '2026-W38', label: 'Week 38 review', date: '2026-09-21', status: 'closed' },
  { id: 'SNAP-W39', week: '2026-W39', label: 'Week 39 review', date: '2026-09-28', status: 'closed' },
  { id: 'SNAP-W40', week: '2026-W40', label: 'Week 40 review', date: '2026-10-05', status: 'amended' },
  { id: 'SNAP-W41', week: '2026-W41', label: 'Week 41 review (current)', date: '2026-10-12', status: 'open' },
];

export const sources: Source[] = [
  {
    id: 'SRC-01', name: 'AI Initiative Register (SharePoint list)', supplies: 'Project identity, owner, stage, weekly status, commitment dates', owner: 'Portfolio and value enablement',
    authoritativeFields: ['Project ID', 'Owner', 'Stage', 'Current commitment date'], cadence: 'Weekly, Friday 17:00', lastRefresh: '2026-10-09 17:12', connectionHealth: 'healthy', contentQuality: 'gaps',
    issues: [{ id: 'SI-01', description: 'No week 41 entry for P-303', affectedRecords: ['P-303', 'C-12'], reconciliationOwner: 'Nadia Rahman', downstream: ['F-05', 'Programme assessment PG-03'] }],
  },
  {
    id: 'SRC-02', name: 'Programme plans (Excel, Teams site)', supplies: 'Milestones, baseline and revised dates, scope changes', owner: 'Programme leads',
    authoritativeFields: ['Baseline date', 'Scope change record'], cadence: 'On change', lastRefresh: '2026-10-09 09:40', connectionHealth: 'healthy', contentQuality: 'conflicts',
    issues: [{ id: 'SI-02', description: 'P-102 commitment date differs between plan (16 Oct) and register (23 Oct)', affectedRecords: ['P-102', 'C-03'], conflictingValues: 'Plan: 2026-10-16; Register: 2026-10-23', reconciliationOwner: 'Ben Okafor', downstream: ['F-01', 'Portfolio matrix'] }],
  },
  {
    id: 'SRC-03', name: 'Finance actuals and forecast (cost centre export)', supplies: 'Budget, actual and forecast by cost centre and period', owner: 'Finance Business Partners',
    authoritativeFields: ['Budget', 'Actual', 'Forecast', 'Cost centre'], cadence: 'Monthly, working day 5', lastRefresh: '2026-10-09 06:00', connectionHealth: 'healthy', contentQuality: 'gaps',
    issues: [{ id: 'SI-03', description: 'Shared cost allocation basis for the context layer not defined', affectedRecords: ['K-07', 'P-401', 'P-102'], reconciliationOwner: 'Finance Business Partner, EDAI', downstream: ['F-10', 'Programme totals PG-01 and PG-04'] }],
  },
  {
    id: 'SRC-04', name: 'Copilot Studio release log', supplies: 'Deployment events, app catalogue publication, enabled security groups', owner: 'AI/ML Engineering',
    authoritativeFields: ['Deployed date', 'Enabled group'], cadence: 'Event driven', lastRefresh: '2026-10-12 08:15', connectionHealth: 'healthy', contentQuality: 'good', issues: [],
  },
  {
    id: 'SRC-05', name: 'Governance intake tracker', supplies: 'Review requests, board decisions, turnaround', owner: 'Omar Siddiqui',
    authoritativeFields: ['Review status', 'Decision date'], cadence: 'Weekly', lastRefresh: '2026-10-09 16:30', connectionHealth: 'healthy', contentQuality: 'good', issues: [],
  },
  {
    id: 'SRC-06', name: 'Model registry (Azure Foundry)', supplies: 'Model versions, endpoints, consuming agents', owner: 'AI/ML Engineering',
    authoritativeFields: ['Model version', 'Endpoint'], cadence: 'Daily', lastRefresh: '2026-10-11 02:00', connectionHealth: 'degraded', contentQuality: 'good',
    issues: [{ id: 'SI-04', description: 'Nightly sync failed 12 Oct; last successful refresh 11 Oct', affectedRecords: ['M-GPT', 'M-NER'], reconciliationOwner: 'AI/ML Engineering', downstream: ['Dependency graph model nodes'] }],
  },
  {
    id: 'SRC-07', name: 'Benefits register (Excel)', supplies: 'Outcome definitions, baselines, forecasts, measurements', owner: 'Programme leads and measurement owners',
    authoritativeFields: ['Baseline', 'Measured value', 'Measurement owner'], cadence: 'Monthly', lastRefresh: '2026-10-03 11:20', connectionHealth: 'healthy', contentQuality: 'gaps',
    issues: [{ id: 'SI-05', description: 'P-203 and P-303 have no outcome measure defined', affectedRecords: ['P-203', 'P-303'], reconciliationOwner: 'Tom Ashworth; Marta Kowalczyk', downstream: ['Outcomes column shows unknown'] }],
  },
];

export const definitions: Definition[] = [
  { id: 'DEF-01', area: 'Portfolio structure', name: 'Programme membership', value: 'A project belongs to exactly one programme for cost and release counting. Objective links are many-to-many and never create duplicate counts.', version: 2, owner: 'Portfolio and value enablement', effectiveDate: '2026-08-01', reason: 'Removed double counting of P-102 across R&D and Foundations.', affects: ['Portfolio matrix', 'Programme totals'], history: [{ version: 1, value: 'A project belongs to the programme that funds the largest share of it.', owner: 'Portfolio and value enablement', effectiveDate: '2026-07-01', reason: 'Initial definition.' }] },
  { id: 'DEF-02', area: 'Delivery definitions', name: 'Delayed commitment', value: 'Current commitment date later than the original by more than five working days, or any commitment past its current date without an actual result.', version: 1, owner: 'Portfolio and value enablement', effectiveDate: '2026-07-01', reason: 'Initial definition.', affects: ['Delivery column', 'Findings: delayed commitment'] },
  { id: 'DEF-03', area: 'Delivery definitions', name: 'Breached', value: 'A commitment or dependency more than 20 working days past its original date with no actual result, or a cost variance above 15 percent.', version: 1, owner: 'Portfolio and value enablement', effectiveDate: '2026-07-01', reason: 'Initial definition.', affects: ['Red condition everywhere'] },
  { id: 'DEF-04', area: 'Release definitions', name: 'Business availability', value: 'A release is available when the enabling security group contains the intended users and the release owner has recorded the enablement date. Deployment alone is not availability.', version: 1, owner: 'AI/ML Engineering and release owners', effectiveDate: '2026-07-01', reason: 'Initial definition.', affects: ['Releases column', 'Weekly releases timeline'] },
  { id: 'DEF-05', area: 'Release definitions', name: 'Release counting', value: 'A release is counted once in portfolio totals however many deployments or projects reference it. Rollout expansions are counted separately as events.', version: 1, owner: 'Portfolio and value enablement', effectiveDate: '2026-07-01', reason: 'Initial definition.', affects: ['Release totals'] },
  { id: 'DEF-06', area: 'Financial measures', name: 'Cost variance', value: 'Forecast minus budget for the fiscal year, in GBP, at project level. Shared allocations are included only once an allocation basis is agreed with Finance.', version: 2, owner: 'Finance Business Partners', effectiveDate: '2026-10-01', reason: 'Added the shared allocation rule after the context layer finance feed was connected.', affects: ['Cost column', 'Findings: cost concern', 'Programme totals'], history: [{ version: 1, value: 'Forecast minus budget for the fiscal year, in GBP, at project level.', owner: 'Finance Business Partners', effectiveDate: '2026-07-01', reason: 'Initial definition.' }] },
  { id: 'DEF-07', area: 'Outcome measures', name: 'Measured outcome', value: 'A value recorded by the named measurement owner against the defined population and period. Forecasts, released capacity and cash savings are shown separately and never summed together.', version: 1, owner: 'Programme leads', effectiveDate: '2026-07-01', reason: 'Initial definition.', affects: ['Outcomes column', 'Briefing cost and outcome section'] },
  { id: 'DEF-08', area: 'Source authority', name: 'Commitment date authority', value: 'The programme plan holds the baseline date. The AI Initiative Register holds the current commitment date. A newer value in the register does not overwrite the plan baseline.', version: 1, owner: 'Portfolio and value enablement', effectiveDate: '2026-07-01', reason: 'Initial definition.', affects: ['Commitment timeline', 'Sources reconciliation'] },
  { id: 'DEF-09', area: 'Review rules', name: 'Materiality', value: 'A finding is material when it affects a commitment within the next two review periods, a cost variance over 10 percent, a governance gate, or a missing weekly update.', version: 1, owner: 'Portfolio and value enablement', effectiveDate: '2026-07-01', reason: 'Initial definition.', affects: ['Findings area', 'Briefing selection'] },
  { id: 'DEF-10', area: 'Briefing templates', name: 'Leadership weekly briefing', value: 'Sections: portfolio position, progress against commitments, weekly releases, material constraints and changes, cost and outcome position, decisions required, actions and owners.', version: 1, owner: 'Portfolio and value enablement', effectiveDate: '2026-07-01', reason: 'Initial definition.', affects: ['Briefing preparation'] },
  { id: 'DEF-11', area: 'Routing', name: 'Response routing', value: 'Delivery and release findings go to the project owner; cost findings to the finance partner for the funding business unit; source issues to the source owner. Responses are due 3 working days after the request.', version: 1, owner: 'Portfolio and value enablement', effectiveDate: '2026-07-01', reason: 'Initial definition.', affects: ['Request response defaults', 'My work'] },
  { id: 'DEF-12', area: 'Routing', name: 'Clarification routing', value: 'Clarification requests on a dependency go to the dependency owner, with the requesting project owner copied. Unanswered requests age after 5 working days.', version: 1, owner: 'Portfolio and value enablement', effectiveDate: '2026-07-01', reason: 'Initial definition.', affects: ['Dependency side panel', 'Decisions and actions aging'] },
];

export const briefings: Briefing[] = [
  {
    id: 'B-W41', audience: 'Enterprise Data and AI leadership', scope: 'All programmes', period: 'Week 41', snapshotId: 'SNAP-W41', status: 'draft', version: 1, revision: 4, templateId: 'DEF-10', updatedAt: '2026-10-12 09:30',
    sections: [
      { key: 'position', title: 'Portfolio position', narrative: 'Two shared constraints dominate: the clinical data lake access decision and the governance review backlog.', itemIds: ['F-01', 'F-02'] },
      { key: 'commitments', title: 'Progress against commitments', narrative: 'Five commitments completed this week, two revised, two carried forward.', itemIds: ['C-01', 'C-06', 'C-10', 'C-13', 'C-15'] },
      { key: 'releases', title: 'Weekly releases', narrative: 'Five releases reached business availability. HCP Engagement Copilot UK pilot is the largest, with 120 reps enabled and 71 active in week one.', itemIds: ['R-01', 'R-02', 'R-03', 'R-05', 'R-06'] },
      { key: 'constraints', title: 'Material constraints and changes', narrative: '', itemIds: ['F-04', 'F-05'] },
      { key: 'cost', title: 'Cost and outcome position', narrative: 'Spend is close to budget overall, with one project well over after scope additions. Deviation closure time is now measured; pre-call time is early evidence only. Figures below come from the snapshot.', itemIds: ['F-03', 'F-09'] },
      { key: 'decisions', title: 'Decisions required', narrative: '', itemIds: ['A-01', 'A-02'] },
      { key: 'actions', title: 'Actions and owners', narrative: '', itemIds: ['A-03', 'A-04', 'A-05'] },
    ],
  },
  {
    id: 'B-W40', audience: 'Enterprise Data and AI leadership', scope: 'All programmes', period: 'Week 40', snapshotId: 'SNAP-W40', status: 'published', version: 2, revision: 7, templateId: 'DEF-10', updatedAt: '2026-10-06 08:10',
    sections: [{ key: 'position', title: 'Portfolio position', narrative: 'Eleven projects reporting; backlog of three in governance review.', itemIds: ['F-01'] }],
  },
];
