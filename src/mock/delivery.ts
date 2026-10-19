import type { Commitment, Release, ScopeChange } from '@/shared/types/domain';

export const commitments: Commitment[] = [
  { id: 'C-01', projectId: 'P-101', title: 'Release 1.3 to Oncology TA', baselineDate: '2026-10-02', currentDate: '2026-10-09', actualDate: '2026-10-09', owner: 'Anjali Mehra', status: 'completed', evidenceId: 'E-01', week: '2026-W41' },
  { id: 'C-02', projectId: 'P-101', title: 'Vaccines TA onboarding', baselineDate: '2026-10-30', currentDate: '2026-10-30', owner: 'Anjali Mehra', status: 'on track', evidenceId: 'E-01', week: '2026-W44' },
  { id: 'C-03', projectId: 'P-102', title: 'Feasibility ranking available to two study teams', baselineDate: '2026-09-25', currentDate: '2026-10-23', owner: 'Ben Okafor', status: 'late', evidenceId: 'E-02', week: '2026-W41' },
  { id: 'C-04', projectId: 'P-102', title: 'Clinical data lake read access granted', baselineDate: '2026-09-11', currentDate: '2026-10-16', owner: 'Data Platform Team', status: 'carried forward', evidenceId: 'E-03', week: '2026-W41' },
  { id: 'C-05', projectId: 'P-103', title: 'Vetting complete and shadow mode started', baselineDate: '2026-10-16', currentDate: '2026-10-16', owner: 'Lucia Ferrante', status: 'on track', evidenceId: 'E-04', week: '2026-W42' },
  { id: 'C-06', projectId: 'P-201', title: 'UK pilot cohort of 120 reps enabled', baselineDate: '2026-10-09', currentDate: '2026-10-09', actualDate: '2026-10-08', owner: 'Sarah Whitfield', status: 'completed', evidenceId: 'E-05', week: '2026-W41' },
  { id: 'C-07', projectId: 'P-201', title: 'Germany cohort enabled', baselineDate: '2026-11-06', currentDate: '2026-11-06', owner: 'Sarah Whitfield', status: 'on track', evidenceId: 'E-05', week: '2026-W45' },
  { id: 'C-08', projectId: 'P-202', title: 'Promotional review board sign-off', baselineDate: '2026-10-02', currentDate: '2026-10-16', owner: 'Dr Rachel Lindqvist', status: 'revised', evidenceId: 'E-06', week: '2026-W41' },
  { id: 'C-09', projectId: 'P-203', title: 'Scope and funding approved', baselineDate: '2026-10-30', currentDate: '2026-10-30', owner: 'Kwame Boateng', status: 'on track', evidenceId: 'E-07', week: '2026-W44' },
  { id: 'C-10', projectId: 'P-301', title: 'Third site (Ware) enabled', baselineDate: '2026-10-09', currentDate: '2026-10-09', actualDate: '2026-10-07', owner: 'Jonas Weber', status: 'completed', evidenceId: 'E-08', week: '2026-W41' },
  { id: 'C-11', projectId: 'P-302', title: 'Europe region forecast in parallel run', baselineDate: '2026-10-16', currentDate: '2026-10-30', owner: 'Helen Osei', status: 'revised', evidenceId: 'E-09', week: '2026-W41' },
  { id: 'C-12', projectId: 'P-303', title: 'Exception rules validated against 200 historical batches', baselineDate: '2026-10-09', currentDate: '2026-10-09', owner: 'Nadia Rahman', status: 'carried forward', evidenceId: 'E-10', week: '2026-W41' },
  { id: 'C-13', projectId: 'P-401', title: 'Finance actuals feed connected', baselineDate: '2026-10-09', currentDate: '2026-10-09', actualDate: '2026-10-09', owner: 'Devon Carlisle', status: 'completed', evidenceId: 'E-11', week: '2026-W41' },
  { id: 'C-14', projectId: 'P-402', title: 'Review turnaround under 10 working days', baselineDate: '2026-09-30', currentDate: '2026-10-31', owner: 'Omar Siddiqui', status: 'late', evidenceId: 'E-12', week: '2026-W41' },
  { id: 'C-15', projectId: 'P-403', title: 'Pattern v4 (SharePoint list retrieval) published', baselineDate: '2026-10-09', currentDate: '2026-10-09', actualDate: '2026-10-09', owner: 'Grace Chen', status: 'completed', evidenceId: 'E-13', week: '2026-W41' },
  { id: 'C-16', projectId: 'P-401', title: 'Model registry connector live', baselineDate: '2026-10-23', currentDate: '2026-10-23', owner: 'Devon Carlisle', status: 'on track', evidenceId: 'E-11', week: '2026-W43' },
];

export const scopeChanges: ScopeChange[] = [
  { id: 'SC-01', projectId: 'P-102', date: '2026-10-06', added: 'Investigator workload signal from CTMS', removed: 'None', revised: 'Country timeline source moved from manual sheet to the clinical data lake extract', ownerReportedEffect: 'Adds two weeks; depends on data lake access that is still pending.', evidenceId: 'E-02' },
  { id: 'SC-02', projectId: 'P-202', date: '2026-10-06', added: 'Mandatory citation of the approved standard response ID in every draft', removed: 'Free-text summarisation of off-label queries', revised: 'None', ownerReportedEffect: 'Rework of the response template; two weeks added to the sign-off date.', evidenceId: 'E-06' },
  { id: 'SC-03', projectId: 'P-302', date: '2026-09-29', added: 'Tender pipeline feed for Europe', removed: 'None', revised: 'Parallel run extended from four to eight weeks at Quality request', ownerReportedEffect: 'Compute and data licence cost increase; forecast now 18 percent over budget.', evidenceId: 'E-09' },
];

export const releases: Release[] = [
  {
    id: 'R-01', projectId: 'P-101', capability: 'Protocol Drafting Assistant 1.3', owner: 'Anjali Mehra', businessCapability: 'Protocol authoring',
    events: [{ kind: 'planned', date: '2026-10-02', note: 'Original plan' }, { kind: 'deployed', date: '2026-10-08', note: 'Deployed to Copilot Studio production environment' }, { kind: 'available', date: '2026-10-09', note: 'Enabled for Oncology TA (42 users)' }],
    enabledTeams: ['Oncology clinical writing', 'Oncology study management'], outstandingConditions: ['Training session for Vaccines TA before 30 Oct'],
    adoption: { period: '9 to 12 Oct', activeUsers: 18, note: '18 of 42 enabled users opened at least one draft. Early evidence.', early: true },
    changesFromPrevious: 'Adds statistical section drafting and references the latest protocol template v7.', previousReleaseId: 'R-00', evidenceId: 'E-01', week: '2026-W41',
  },
  {
    id: 'R-02', projectId: 'P-201', capability: 'HCP Engagement Copilot, UK pilot', owner: 'Sarah Whitfield', businessCapability: 'Field pre-call preparation',
    events: [{ kind: 'planned', date: '2026-10-09', note: 'Original plan' }, { kind: 'deployed', date: '2026-10-07', note: 'Teams app published to UK pilot group' }, { kind: 'available', date: '2026-10-08', note: '120 reps enabled across three regions' }],
    enabledTeams: ['UK Respiratory field team', 'UK Vaccines field team'], outstandingConditions: ['Veeva CRM write-back remains disabled pending privacy confirmation'],
    adoption: { period: '8 to 12 Oct', activeUsers: 71, note: '71 reps generated a pre-call brief. Business feedback collected on Friday huddle.', early: true },
    changesFromPrevious: 'First business release.', evidenceId: 'E-05', week: '2026-W41',
  },
  {
    id: 'R-03', projectId: 'P-301', capability: 'Deviation Investigation Assistant at Ware', owner: 'Jonas Weber', businessCapability: 'Deviation investigation',
    events: [{ kind: 'planned', date: '2026-10-09', note: 'Original plan' }, { kind: 'deployed', date: '2026-10-06', note: 'Site configuration applied' }, { kind: 'available', date: '2026-10-07', note: 'QA investigators at Ware enabled' }, { kind: 'expanded', date: '2026-10-10', note: 'Extended to second shift' }],
    enabledTeams: ['Ware QA investigations', 'Ware production support'], outstandingConditions: [],
    adoption: { period: '7 to 12 Oct', activeUsers: 14, note: '14 investigators, 23 draft reports produced.', early: true },
    changesFromPrevious: 'Site-specific deviation taxonomy and local batch record templates.', previousReleaseId: 'R-03a', evidenceId: 'E-08', week: '2026-W41',
  },
  {
    id: 'R-04', projectId: 'P-202', capability: 'Medical Information Response Agent, EU pilot', owner: 'Dr Rachel Lindqvist', businessCapability: 'Medical information response',
    events: [{ kind: 'planned', date: '2026-10-09', note: 'Original plan' }, { kind: 'planned', date: '2026-10-23', note: 'Moved after promotional review returned the solution' }],
    enabledTeams: [], outstandingConditions: ['Promotional review board sign-off', 'Standard response citation rework'],
    changesFromPrevious: 'Not yet released.', evidenceId: 'E-06', week: '2026-W41',
  },
  {
    id: 'R-05', projectId: 'P-403', capability: 'Pattern v4: SharePoint list retrieval', owner: 'Grace Chen', businessCapability: 'Agent build patterns',
    events: [{ kind: 'planned', date: '2026-10-09', note: 'Original plan' }, { kind: 'deployed', date: '2026-10-09', note: 'Published to the pattern library' }, { kind: 'available', date: '2026-10-09', note: 'Available to all agent builders in the tenant' }],
    enabledTeams: ['All agent build teams'], outstandingConditions: [],
    adoption: { period: '9 to 12 Oct', activeUsers: 6, note: 'Six builders cloned the pattern.', early: true },
    changesFromPrevious: 'Replaces manual connector setup with a tested retrieval pattern that passes tenant guardrails.', evidenceId: 'E-13', week: '2026-W41',
  },
  {
    id: 'R-06', projectId: 'P-401', capability: 'Context layer: finance actuals feed', owner: 'Devon Carlisle', businessCapability: 'Portfolio context',
    events: [{ kind: 'planned', date: '2026-10-09', note: 'Original plan' }, { kind: 'deployed', date: '2026-10-09', note: 'Connector deployed' }, { kind: 'available', date: '2026-10-09', note: 'Available to portfolio agents' }],
    enabledTeams: ['Portfolio and value enablement'], outstandingConditions: ['Finance to confirm allocation basis for shared costs'],
    changesFromPrevious: 'Monthly actuals by cost centre now available alongside budget.', evidenceId: 'E-11', week: '2026-W41',
  },
  {
    id: 'R-07', projectId: 'P-302', capability: 'Demand Sensing Agent, Europe parallel run', owner: 'Helen Osei', businessCapability: 'Demand planning',
    events: [{ kind: 'planned', date: '2026-10-16', note: 'Original plan' }, { kind: 'planned', date: '2026-10-30', note: 'Parallel run extended to eight weeks' }],
    enabledTeams: [], outstandingConditions: ['Tender feed licence', 'AI governance review'],
    changesFromPrevious: 'Not yet released.', evidenceId: 'E-09', week: '2026-W43',
  },
  {
    id: 'R-08', projectId: 'P-101', capability: 'Protocol Drafting Assistant 1.2 (withdrawn section)', owner: 'Anjali Mehra', businessCapability: 'Protocol authoring',
    events: [{ kind: 'available', date: '2026-09-18', note: 'Statistical section preview enabled' }, { kind: 'withdrawn', date: '2026-09-25', note: 'Preview withdrawn after reviewer feedback; replaced in 1.3' }],
    enabledTeams: ['Oncology clinical writing'], outstandingConditions: [],
    changesFromPrevious: 'Preview of statistical section drafting.', evidenceId: 'E-01', week: '2026-W39',
  },
];
