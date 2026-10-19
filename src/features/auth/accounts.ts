import type { User } from '@/shared/types/workflow';

/** Directory accounts the tenant exposes to this application. Replaced by the identity provider's claims in production. */
export const ACCOUNTS: User[] = [
  { id: 'u-devon', name: 'Devon Carlisle', email: 'devon.carlisle@gsk.com', role: 'Portfolio lead', team: 'Portfolio and value enablement', initials: 'DC' },
  { id: 'u-cdao', name: 'Chief Data and AI Officer', email: 'cdao.office@gsk.com', role: 'Sponsor', team: 'Enterprise Data and AI', initials: 'CD', programmeIds: ['PG-04'] },
  { id: 'u-priya', name: 'Priya Natarajan', email: 'priya.natarajan@gsk.com', role: 'Sponsor', team: 'Clinical Development Intelligence', initials: 'PN', programmeIds: ['PG-01'] },
  { id: 'u-ben', name: 'Ben Okafor', email: 'ben.okafor@gsk.com', role: 'Project lead', team: 'Trial Site Feasibility Agent', initials: 'BO', projectIds: ['P-102'] },
  { id: 'u-helen', name: 'Helen Osei', email: 'helen.osei@gsk.com', role: 'Project lead', team: 'Demand Sensing Agent', initials: 'HO', projectIds: ['P-302'] },
  { id: 'u-fin', name: 'Finance Business Partner, EDAI', email: 'edai.finance@gsk.com', role: 'Finance', team: 'Finance', initials: 'FB' },
  { id: 'u-nadia', name: 'Nadia Rahman', email: 'nadia.rahman@gsk.com', role: 'Reporting or data owner', team: 'AI Initiative Register and benefits register', initials: 'NR', sourceIds: ['SRC-01', 'SRC-07'] },
];
