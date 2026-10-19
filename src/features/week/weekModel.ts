import type { Commitment, Finding, Project, Release, ScopeChange } from '@/shared/types/domain';
import type { Snapshot } from '@/shared/types/governance';

export type QueueGroup = 'Commitments completed or progressed' | 'Changes to understand' | 'Releases delivered or moved' | 'Decisions and responses required' | 'Items carried forward';

export type QueueItem = {
  id: string;
  group: QueueGroup;
  projectId: string;
  projectName: string;
  title: string;
  owner: string;
  previous: string;
  current: string;
  /** When the event happened. */
  date: string;
  /** When the platform received the record. Only set from the record itself, never inferred. */
  receivedDate?: string;
  /** A finding's response deadline, a separate thing from when anything arrived. */
  responseDue?: string;
  findingId?: string;
  evidenceId: string;
  kind: 'commitment' | 'scope' | 'release' | 'finding';
  /** Week the item first became open, set only when that is before the week under review. */
  openSince?: string;
};

/** The review period the open snapshot covers: the seven days up to and including its review date. */
export type ReviewPeriod = { week: string; start: string; end: string };

export function addDays(iso: string, days: number): string {
  return new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

export function reviewPeriod(snapshot: Pick<Snapshot, 'week' | 'date'>): ReviewPeriod {
  return { week: snapshot.week, start: addDays(snapshot.date, -7), end: snapshot.date };
}

/** "2026-W41" to "Week 41". */
export function weekLabel(week: string): string {
  const n = week.split('-W')[1];
  return n ? `Week ${Number(n)}` : week;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-10-07" to "7 Oct". Inside one review the year adds nothing. */
export function shortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return m && d ? `${Number(d)} ${MONTHS[Number(m) - 1]}` : iso;
}

const received = (date?: string) => (date ? { receivedDate: date } : {});

/** ISO 8601 week of a date, "2026-09-11" to "2026-W37". The Thursday of the week decides which year it belongs to. */
export function isoWeek(iso: string): string {
  const t = new Date(`${iso}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7) + 3);
  const year = t.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  firstThursday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3);
  const week = 1 + Math.round((t.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/** A carried-forward commitment has been open since the week it was first due; anything due inside this period is not carried. */
const since = (week: string, period: ReviewPeriod) => (week < period.week ? { openSince: week } : {});

export function buildQueue(projects: Project[], commitments: Commitment[], scopeChanges: ScopeChange[], releases: Release[], findings: Finding[], period: ReviewPeriod): QueueItem[] {
  const name = (id: string) => projects.find((p) => p.id === id)?.name ?? id;
  const items: QueueItem[] = [];

  commitments.filter((c) => c.week === period.week).forEach((c) => {
    const base: Omit<QueueItem, 'group'> = { id: c.id, projectId: c.projectId, projectName: name(c.projectId), title: c.title, owner: c.owner, previous: `Due ${c.baselineDate}`, current: c.actualDate ? `Done ${c.actualDate}` : `Due ${c.currentDate}`, date: c.actualDate ?? c.currentDate, ...received(c.receivedDate), evidenceId: c.evidenceId, kind: 'commitment' };
    if (c.status === 'completed') items.push({ ...base, group: 'Commitments completed or progressed' });
    else if (c.status === 'carried forward') items.push({ ...base, group: 'Items carried forward', ...since(isoWeek(c.baselineDate), period) });
    else if (c.status === 'late' || c.status === 'revised') {
      const findingId = findings.find((f) => f.affectedIds.includes(c.id))?.id;
      items.push({ ...base, group: 'Changes to understand', ...(findingId ? { findingId } : {}) });
    }
  });

  scopeChanges.filter((s) => s.date >= period.start && s.date <= period.end).forEach((s) => {
    items.push({ id: s.id, group: 'Changes to understand', projectId: s.projectId, projectName: name(s.projectId), title: `Scope change: added ${s.added}; removed ${s.removed}; revised ${s.revised}`, owner: projects.find((p) => p.id === s.projectId)?.owner ?? '', previous: 'Scope as planned', current: s.ownerReportedEffect, date: s.date, evidenceId: s.evidenceId, kind: 'scope' });
  });

  releases.filter((r) => r.week === period.week).forEach((r) => {
    const available = r.events.find((e) => e.kind === 'available');
    const planned = r.events.filter((e) => e.kind === 'planned');
    items.push({ id: r.id, group: 'Releases delivered or moved', projectId: r.projectId, projectName: name(r.projectId), title: r.capability, owner: r.owner, previous: `Planned ${planned[0]?.date ?? 'n/a'}`, current: available ? `Available ${available.date}` : `Moved to ${planned[planned.length - 1]?.date ?? 'n/a'}`, date: available?.date ?? planned[planned.length - 1]?.date ?? period.end, ...received(r.receivedDate), evidenceId: r.evidenceId, kind: 'release' });
  });

  findings.filter((f) => (f.category === 'decision needed' || f.requestedOwner) && f.responses.every((r) => r.findingVersion !== f.version)).forEach((f) => {
    const projectId = f.affectedIds.find((a) => a.startsWith('P-')) ?? '';
    items.push({ id: f.id, group: 'Decisions and responses required', projectId, projectName: name(projectId), title: f.title, owner: f.requestedOwner ?? 'Portfolio lead', previous: f.previousPosition, current: f.currentPosition, date: f.firstSeenWeek === period.week ? period.end : period.start, ...(f.dueDate ? { responseDue: f.dueDate } : {}), findingId: f.id, evidenceId: f.evidenceIds[0] ?? '', kind: 'finding', ...since(f.firstSeenWeek, period) });
  });

  return items;
}

export const GROUP_ORDER: QueueGroup[] = ['Commitments completed or progressed', 'Changes to understand', 'Releases delivered or moved', 'Decisions and responses required', 'Items carried forward'];

export type ItemStatus = { tone: 'success' | 'warning' | 'danger' | 'neutral'; text: string };

/** The chip on a queue row. It restates the record's own state; an overdue response is the only judgement and uses the review end date. */
export function itemStatus(it: QueueItem, period: ReviewPeriod): ItemStatus {
  if (it.responseDue && it.responseDue < period.end) return { tone: 'danger', text: `Response overdue, due ${shortDate(it.responseDue)}` };
  if (it.group === 'Decisions and responses required') return { tone: 'warning', text: it.responseDue ? `Response due ${shortDate(it.responseDue)}` : 'Decision needed' };
  if (it.group === 'Items carried forward') return { tone: 'neutral', text: 'Carried forward' };
  if (it.group === 'Commitments completed or progressed') return { tone: 'success', text: 'Completed' };
  if (it.kind === 'release') return it.current.startsWith('Available') ? { tone: 'success', text: 'Available' } : { tone: 'warning', text: 'Moved' };
  return { tone: 'warning', text: it.kind === 'scope' ? 'Scope changed' : 'Date moved' };
}
