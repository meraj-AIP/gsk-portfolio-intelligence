import type { CostRecord, OutcomeMeasure } from '@/shared/types/domain';

const cost = (id: string, projectId: string, kind: CostRecord['kind'], amount: number, fundedBy: string, period = 'FY26 YTD', basis = 'Direct'): CostRecord => ({
  id, projectId, period, amount, currency: 'GBP', kind, fundedBy, allocationBasis: basis,
});

export const costRecords: CostRecord[] = [
  cost('K-01', 'P-101', 'budget', 420000, 'R&D'), cost('K-02', 'P-101', 'actual', 388000, 'R&D'), cost('K-03', 'P-101', 'forecast', 415000, 'R&D'),
  cost('K-04', 'P-102', 'budget', 310000, 'R&D'), cost('K-05', 'P-102', 'actual', 192000, 'R&D'), cost('K-06', 'P-102', 'forecast', 338000, 'R&D'),
  cost('K-07', 'P-102', 'budget', 90000, 'Enterprise Data and AI', 'FY26 YTD', 'Shared, 40 percent of context layer effort'),
  cost('K-08', 'P-103', 'budget', 260000, 'R&D'), cost('K-09', 'P-103', 'actual', 171000, 'R&D'), cost('K-10', 'P-103', 'forecast', 255000, 'R&D'),
  cost('K-11', 'P-201', 'budget', 540000, 'Commercial'), cost('K-12', 'P-201', 'actual', 467000, 'Commercial'), cost('K-13', 'P-201', 'forecast', 530000, 'Commercial'),
  cost('K-14', 'P-202', 'budget', 300000, 'Medical Affairs'), cost('K-15', 'P-202', 'actual', 214000, 'Medical Affairs'), cost('K-16', 'P-202', 'forecast', 312000, 'Medical Affairs'),
  cost('K-17', 'P-203', 'budget', 120000, 'Commercial'), cost('K-18', 'P-203', 'actual', 18000, 'Commercial'), cost('K-19', 'P-203', 'forecast', 120000, 'Commercial'),
  cost('K-20', 'P-301', 'budget', 480000, 'Global Supply Chain'), cost('K-21', 'P-301', 'actual', 455000, 'Global Supply Chain'), cost('K-22', 'P-301', 'forecast', 472000, 'Global Supply Chain'),
  cost('K-23', 'P-302', 'budget', 390000, 'Global Supply Chain'), cost('K-24', 'P-302', 'actual', 301000, 'Global Supply Chain'), cost('K-25', 'P-302', 'forecast', 460000, 'Global Supply Chain'),
  cost('K-26', 'P-303', 'budget', 220000, 'Quality'), cost('K-27', 'P-303', 'actual', 96000, 'Quality'), cost('K-28', 'P-303', 'forecast', 220000, 'Quality'),
  cost('K-29', 'P-401', 'budget', 650000, 'Enterprise Data and AI'), cost('K-30', 'P-401', 'actual', 512000, 'Enterprise Data and AI'), cost('K-31', 'P-401', 'forecast', 640000, 'Enterprise Data and AI'),
  cost('K-32', 'P-402', 'budget', 280000, 'Enterprise Data and AI'), cost('K-33', 'P-402', 'actual', 241000, 'Enterprise Data and AI'), cost('K-34', 'P-402', 'forecast', 295000, 'Enterprise Data and AI'),
  cost('K-35', 'P-403', 'budget', 180000, 'Enterprise Data and AI'), cost('K-36', 'P-403', 'actual', 149000, 'Enterprise Data and AI'), cost('K-37', 'P-403', 'forecast', 176000, 'Enterprise Data and AI'),
];

export const outcomeMeasures: OutcomeMeasure[] = [
  { id: 'OM-01', projectId: 'P-101', name: 'Protocol first-draft cycle time', definition: 'Working days from synopsis approval to first full protocol draft, Oncology TA studies', baseline: '34 days', forecast: '21 days', kind: 'forecast benefit', owner: 'Priya Natarajan', period: 'Measurement due Q4 FY26', evidenceId: 'E-14' },
  { id: 'OM-02', projectId: 'P-101', name: 'Writer hours released', definition: 'Hours per protocol reported by clinical writers', baseline: '0', forecast: '26 hours per protocol', kind: 'released capacity', owner: 'Anjali Mehra', period: 'Q4 FY26', evidenceId: 'E-14' },
  { id: 'OM-03', projectId: 'P-201', name: 'Pre-call preparation time', definition: 'Self-reported minutes per call, UK pilot cohort', baseline: '22 minutes', forecast: '8 minutes', actual: '11 minutes (week 1, 71 reps)', kind: 'measured outcome', owner: 'Sarah Whitfield', period: '8 to 12 Oct, early', evidenceId: 'E-16' },
  { id: 'OM-04', projectId: 'P-202', name: 'Medical information response turnaround', definition: 'Hours from request to approved response, EU', baseline: '31 hours', forecast: '12 hours', kind: 'forecast benefit', owner: 'Dr Rachel Lindqvist', period: 'Not yet measurable', evidenceId: 'E-06' },
  { id: 'OM-05', projectId: 'P-301', name: 'Deviation closure time', definition: 'Calendar days from deviation raised to investigation approved, Barnard Castle', baseline: '11.4 days', forecast: '8 days', actual: '7.9 days (Aug to Sep)', kind: 'measured outcome', owner: 'Marta Kowalczyk', period: 'Aug to Sep FY26', evidenceId: 'E-15' },
  { id: 'OM-06', projectId: 'P-301', name: 'External investigation support cost', definition: 'Contractor spend on investigation drafting at enabled sites', baseline: '£38k per quarter', forecast: '£12k per quarter', actual: '£19k (Q3)', kind: 'cash saving', owner: 'Marta Kowalczyk', period: 'Q3 FY26', evidenceId: 'E-15' },
  { id: 'OM-07', projectId: 'P-302', name: 'Forecast accuracy', definition: 'Weighted MAPE at SKU and country level, Europe', baseline: '31 percent', forecast: '24 percent', kind: 'forecast benefit', owner: 'Helen Osei', period: 'After parallel run', evidenceId: 'E-09' },
  { id: 'OM-08', projectId: 'P-403', name: 'Agent time to first guardrail pass', definition: 'Working days from build start to passing tenant security checks', baseline: '19 days', forecast: '6 days', actual: '7 days (last four agents)', kind: 'measured outcome', owner: 'Grace Chen', period: 'Sep to Oct FY26', evidenceId: 'E-13' },
  { id: 'OM-09', projectId: 'P-402', name: 'Governance review turnaround', definition: 'Working days from intake complete to board decision', baseline: '17 days', forecast: '10 days', actual: '14 days (Sep)', kind: 'measured outcome', owner: 'Omar Siddiqui', period: 'Sep FY26', evidenceId: 'E-12' },
];
