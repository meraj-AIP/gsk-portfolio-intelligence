import type { Condition } from '@/shared/types/domain';

export const gbp = (n: number): string => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);

export const gbpShort = (n: number): string => (Math.abs(n) >= 1_000_000 ? `£${(n / 1_000_000).toFixed(2)}m` : `£${Math.round(n / 1000)}k`);

export const formatDate = (iso: string): string => {
  const [y, m, d] = iso.split(' ')[0]?.split('-') ?? [];
  if (!y || !m || !d) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
};

export const CONDITION_LABEL: Record<Condition, string> = {
  met: 'Meets the requirement',
  attention: 'Needs attention',
  breached: 'Breached commitment or criterion',
  reported: 'Reported, not assessed',
  unknown: 'Insufficient information',
};

export const CONDITION_SHORT: Record<Condition, string> = {
  met: 'Met', attention: 'Attention', breached: 'Breached', reported: 'Reported', unknown: 'Unknown',
};

export const daysBetween = (a: string, b: string): number => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);

export const percent = (part: number, whole: number): string => (whole === 0 ? 'n/a' : `${Math.round((part / whole) * 100)} percent`);

export const entityRoute = (id: string): string | null => {
  if (id.startsWith('PG-')) return `/programmes/${id}`;
  if (id.startsWith('P-')) return `/projects/${id}`;
  if (id.startsWith('R-')) return `/this-week?tab=releases&release=${id}`;
  if (id.startsWith('DEP-')) return `/portfolio?tab=constraints&focus=${id}`;
  // Decisions are D-01 style; D-CDL style ids are datasets, so they go to their constraint trace like models, teams and services.
  if (/^(A|D)-\d/.test(id)) return '/decisions';
  if (/^(D|M|T|S)-[A-Z]/.test(id)) return `/portfolio?tab=constraints&constraint=${id}`;
  return null;
};
