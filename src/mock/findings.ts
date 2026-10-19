import type { Action, Decision, Finding } from '@/shared/types/domain';

export const findings: Finding[] = [
  {
    id: 'F-01', title: 'Clinical data lake access decision overdue by four weeks; feasibility commitment slipped', category: 'decision needed', statementType: 'reported fact',
    affectedIds: ['P-102', 'C-03', 'C-04', 'DEP-01', 'DEP-16'], previousPosition: 'Access expected 11 Sep; commitment 25 Sep', currentPosition: 'No decision recorded; commitment moved to 23 Oct',
    significance: 'Blocks the only R&D project not yet in business use and the same decision governs Safety Signal Triage from 1 Nov.',
    evidenceIds: ['E-02', 'E-03'], unknowns: 'Whether the Data Platform policy decision needs sponsor escalation or the context layer route (P-401) is acceptable as-is.', version: 3, firstSeenWeek: '2026-W38', persistent: true,
    responses: [{ id: 'RS-01', findingVersion: 2, reviewer: 'Ben Okafor', date: '2026-10-05', action: 'confirmed', note: 'Confirmed. Escalation requested through programme lead.' }], requestedOwner: 'Priya Natarajan', dueDate: '2026-10-14',
  },
  {
    id: 'F-02', title: 'Governance review backlog rose from three to five solutions; turnaround 14 days against a 10-day target', category: 'governance', statementType: 'calculated result',
    affectedIds: ['P-402', 'P-102', 'P-103', 'P-202', 'P-302', 'P-303', 'DEP-05', 'DEP-06'], previousPosition: 'Backlog 3', currentPosition: 'Backlog 5',
    significance: 'Shared constraint on five projects across three programmes. Second reviewer funding decision due 17 Oct.',
    evidenceIds: ['E-12', 'E-18'], unknowns: 'Whether the 14-day figure includes the P-202 resubmission.', version: 2, firstSeenWeek: '2026-W40', persistent: true, responses: [], requestedOwner: 'Omar Siddiqui', dueDate: '2026-10-15',
  },
  {
    id: 'F-03', title: 'Demand Sensing forecast now 18 percent over budget after scope additions', category: 'cost concern', statementType: 'calculated result',
    affectedIds: ['P-302', 'C-11', 'SC-03', 'DEP-09'], previousPosition: 'Forecast £395k (1 percent over)', currentPosition: 'Forecast £460k (18 percent over)',
    significance: 'Largest single variance in the portfolio. Driven by tender feed licence and an eight-week parallel run requested by Quality.',
    evidenceIds: ['E-09'], unknowns: 'Whether Quality will accept a shorter parallel run for one region.', version: 1, firstSeenWeek: '2026-W41', persistent: false, responses: [], requestedOwner: 'Helen Osei', dueDate: '2026-10-16',
  },
  {
    id: 'F-04', title: 'Medical Information agent returned by promotional review; sign-off moved two weeks', category: 'release issue', statementType: 'reported fact',
    affectedIds: ['P-202', 'C-08', 'R-04', 'SC-02'], previousPosition: 'Sign-off 2 Oct, EU pilot 9 Oct', currentPosition: 'Sign-off 16 Oct, EU pilot 23 Oct',
    significance: 'EU pilot release moves out of October. Requires a second governance review slot.',
    evidenceIds: ['E-06'], unknowns: 'None.', version: 1, firstSeenWeek: '2026-W41', persistent: false, responses: [], requestedOwner: 'Dr Rachel Lindqvist', dueDate: '2026-10-14',
  },
  {
    id: 'F-05', title: 'No weekly update received for Batch Record Review Agent', category: 'missing information', statementType: 'reported fact',
    affectedIds: ['P-303', 'C-12', 'DEP-08'], previousPosition: 'Update received 2 Oct (Amber)', currentPosition: 'No update for week ending 9 Oct',
    significance: 'Commitment C-12 was due 9 Oct and its position is unknown. Programme assessment for Supply Chain carries this gap.',
    evidenceIds: ['E-10'], unknowns: 'Whether the 200-batch validation completed.', version: 1, firstSeenWeek: '2026-W41', persistent: false, responses: [], requestedOwner: 'Nadia Rahman', dueDate: '2026-10-13',
  },
  {
    id: 'F-06', title: 'Veeva write-back privacy confirmation may expose the Germany cohort date', category: 'delayed commitment', statementType: 'AI interpretation',
    affectedIds: ['P-201', 'C-07', 'DEP-04', 'DEP-15'], previousPosition: 'Not raised', currentPosition: 'Privacy assessment in progress; required by 24 Oct',
    significance: 'Interpretation only. The owner has not reported a delay. The exposure comes from the privacy date sitting 13 days before the cohort date.',
    evidenceIds: ['E-05'], unknowns: 'Privacy Office expected completion date.', version: 1, firstSeenWeek: '2026-W41', persistent: false, responses: [], requestedOwner: 'Sarah Whitfield', dueDate: '2026-10-17',
  },
  {
    id: 'F-07', title: 'Shared SAP batch record connection could be reused by Batch Record Review', category: 'decision needed', statementType: 'AI interpretation',
    affectedIds: ['P-301', 'P-303', 'DEP-07', 'DEP-08'], previousPosition: 'Not raised', currentPosition: 'Candidate reuse relationship; owner assessment needed',
    significance: 'Could remove a dependency and four weeks of integration effort from P-303. Requires Manufacturing IT confirmation.',
    evidenceIds: ['E-08', 'E-10'], unknowns: 'Whether the P-303 feed needs fields the P-301 connection does not carry.', version: 1, firstSeenWeek: '2026-W41', persistent: false, responses: [], requestedOwner: 'Nadia Rahman',
  },
  {
    id: 'F-08', title: 'Protocol cycle time benefit remains a forecast; no measurement yet', category: 'missing information', statementType: 'reported fact',
    affectedIds: ['P-101', 'OM-01', 'OM-02'], previousPosition: 'Forecast', currentPosition: 'Forecast; measurement window opens after three studies complete',
    significance: 'Largest forecast benefit in R&D is still unmeasured. Release 1.3 adoption is early evidence only.',
    evidenceIds: ['E-14', 'E-01'], unknowns: 'Expected date of the third completed draft.', version: 2, firstSeenWeek: '2026-W39', persistent: true,
    responses: [{ id: 'RS-02', findingVersion: 1, reviewer: 'Priya Natarajan', date: '2026-09-28', action: 'confirmed', note: 'Correct. Measurement window expected mid-November.' }], requestedOwner: 'Priya Natarajan',
  },
  {
    id: 'F-09', title: 'Deviation closure time measured at 7.9 days against 11.4 baseline', category: 'release issue', statementType: 'reported fact',
    affectedIds: ['P-301', 'OM-05', 'OM-06', 'DEP-14'], previousPosition: 'Forecast 8 days', currentPosition: 'Measured 7.9 days (Aug to Sep, Barnard Castle)',
    significance: 'First measured outcome in the portfolio. Supports the Ware rollout decision.',
    evidenceIds: ['E-15'], unknowns: 'Whether the result holds at Ware after the second shift was added.', version: 1, firstSeenWeek: '2026-W41', persistent: false,
    responses: [{ id: 'RS-03', findingVersion: 1, reviewer: 'Marta Kowalczyk', date: '2026-10-10', action: 'confirmed', note: 'Confirmed by site QA.' }],
  },
  {
    id: 'F-10', title: 'Shared cost allocation basis for the context layer not confirmed by Finance', category: 'cost concern', statementType: 'reported fact',
    affectedIds: ['P-401', 'P-102', 'R-06'], previousPosition: 'Not raised', currentPosition: 'Finance actuals connected; allocation basis open',
    significance: 'Programme totals exclude the £90k shared contribution until the basis is agreed, so R&D totals may be understated.',
    evidenceIds: ['E-11', 'E-17'], unknowns: 'Finance confirmation date.', version: 1, firstSeenWeek: '2026-W41', persistent: false, responses: [], requestedOwner: 'Devon Carlisle', dueDate: '2026-10-20',
  },
];

export const decisions: Decision[] = [
  { id: 'D-01', question: 'Should every agent release require vetting service sign-off before business availability?', conclusion: 'Yes. Mandatory from 29 Sep.', decisionMaker: 'Chief Data and AI Officer', date: '2026-09-29', conditions: 'Second reviewer funding to be decided by 17 Oct.', reference: 'E-18', findingId: 'F-02', actionIds: ['A-02'] },
  { id: 'D-02', question: 'Does the Medical Information agent proceed to EU markets?', conclusion: 'Not yet. Returned by promotional review with two conditions.', decisionMaker: 'Commercial Compliance', date: '2026-10-06', conditions: 'Cite approved SR ID; remove off-label summarisation.', reference: 'E-06', findingId: 'F-04', actionIds: ['A-03'] },
  { id: 'D-03', question: 'Proceed with Ware site enablement for the deviation assistant?', conclusion: 'Approved on the basis of the Barnard Castle measured result.', decisionMaker: 'SVP Global Supply Chain', date: '2026-10-03', conditions: 'Re-measure at Ware after four weeks.', reference: 'E-15', findingId: 'F-09', actionIds: ['A-06'] },
];

export const actions: Action[] = [
  { id: 'A-01', title: 'Escalate clinical data lake access decision to sponsor', owner: 'Priya Natarajan', dueDate: '2026-10-14', status: 'in progress', findingId: 'F-01', createdWeek: '2026-W39', history: [{ date: '2026-09-28', note: 'Raised with Data Platform lead.' }, { date: '2026-10-05', note: 'Escalation memo drafted; sponsor meeting 14 Oct.' }] , version: 1 },
  { id: 'A-02', title: 'Decide second reviewer funding for the governance board', owner: 'Chief Data and AI Officer', dueDate: '2026-10-17', status: 'open', findingId: 'F-02', createdWeek: '2026-W40', history: [{ date: '2026-09-29', note: 'Created from decision D-01.' }] , version: 1 },
  { id: 'A-03', title: 'Rework response template to cite SR IDs and resubmit to promotional review', owner: 'Dr Rachel Lindqvist', dueDate: '2026-10-14', status: 'in progress', findingId: 'F-04', createdWeek: '2026-W41', history: [{ date: '2026-10-07', note: 'Template rework started.' }] , version: 1 },
  { id: 'A-04', title: 'Propose scope options for Demand Sensing to bring forecast within budget', owner: 'Helen Osei', dueDate: '2026-10-16', status: 'open', findingId: 'F-03', createdWeek: '2026-W41', history: [] , version: 1 },
  { id: 'A-05', title: 'Provide week 41 update for Batch Record Review Agent', owner: 'Nadia Rahman', dueDate: '2026-10-13', status: 'blocked', blocker: 'Owner on leave until 13 Oct; deputy not named.', findingId: 'F-05', createdWeek: '2026-W41', history: [] , version: 1 },
  { id: 'A-06', title: 'Re-measure deviation closure time at Ware', owner: 'Jonas Weber', dueDate: '2026-11-07', status: 'open', findingId: 'F-09', createdWeek: '2026-W41', history: [] , version: 1 },
  { id: 'A-07', title: 'Confirm Privacy Office date for Veeva write-back assessment', owner: 'Sarah Whitfield', dueDate: '2026-10-17', status: 'reported complete', completionEvidence: 'Privacy Office email 10 Oct: assessment due 21 Oct.', findingId: 'F-06', createdWeek: '2026-W41', history: [{ date: '2026-10-10', note: 'Date confirmed by Privacy Office.' }] , version: 1 },
  { id: 'A-08', title: 'Confirm shared cost allocation basis for the context layer', owner: 'Finance Business Partner, EDAI', dueDate: '2026-10-20', status: 'open', findingId: 'F-10', createdWeek: '2026-W41', history: [] , version: 1 },
  { id: 'A-09', title: 'Vaccines TA onboarding training for Protocol Drafting Assistant', owner: 'Anjali Mehra', dueDate: '2026-10-24', status: 'in progress', createdWeek: '2026-W40', history: [{ date: '2026-10-09', note: 'Session booked for 24 Oct.' }] , version: 1 },
];
