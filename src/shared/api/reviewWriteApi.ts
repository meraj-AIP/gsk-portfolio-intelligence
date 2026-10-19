import type { Briefing, BriefingStatus, Snapshot } from '@/shared/types/domain';
import type { Amendment } from '@/shared/types/workflow';
import { audit, authorise } from './audit';
import { briefingFigures } from '@/shared/lib/assessment';
import { projectIdsInScope } from './listApi';
import { captureContent, weekNumber } from './snapshots';
import { fail, nextId, respond, store, today } from './store';

const addDays = (iso: string, days: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

/**
 * Freezes the open review and opens the next one. The caller names the review it is closing, so a second click
 * or a second reviewer cannot close the following week by accident.
 */
export function closeWeeklyReview(expectedSnapshotId: string): Promise<Snapshot> {
  const auth = authorise('close review');
  if ('error' in auth) return fail(auth.error);
  const open = store.snapshots.find((s) => s.status === 'open');
  if (!open || open.id !== expectedSnapshotId) return fail('This review is already closed. Corrections now go in as amendments.');
  open.content = captureContent(store, `${today} 17:30`, auth.user.name);
  open.status = 'closed';
  open.label = open.label.replace(' (current)', '');
  const n = weekNumber(open.week) + 1;
  const next: Snapshot = { id: `SNAP-W${n}`, week: `2026-W${n}`, label: `Week ${n} review (current)`, date: addDays(open.date, 7), status: 'open' };
  store.snapshots.push(next);
  audit(auth.user, { kind: 'review closed', targetId: open.id, summary: `Closed ${open.label}; opened ${next.label}`, inputs: { expectedSnapshotId } });
  return respond(next, 500);
}

export type AmendInput = { snapshotId: string; recordId: string; correction: string; reason: string };

/** A closed review is never edited in place; the correction is appended and the snapshot is marked amended. */
export function amendSnapshot(input: AmendInput): Promise<Snapshot> {
  const auth = authorise('amend snapshot');
  if ('error' in auth) return fail(auth.error);
  const snap = store.snapshots.find((s) => s.id === input.snapshotId);
  if (!snap) return fail('Snapshot not found.');
  if (snap.status === 'open') return fail('The open review can be changed directly; amendments apply to closed reviews.');
  if (!input.correction.trim() || !input.reason.trim()) return fail('An amendment needs the correction and the reason.');
  const amendment: Amendment = { id: nextId('AM', snap.amendments ?? []), date: today, by: auth.user.name, recordId: input.recordId, correction: input.correction.trim(), reason: input.reason.trim() };
  snap.amendments = [...(snap.amendments ?? []), amendment];
  snap.status = 'amended';
  audit(auth.user, { kind: 'snapshot amended', targetId: snap.id, summary: `${input.recordId}: ${amendment.correction}`, inputs: { ...input } });
  return respond(snap);
}

/** Pulls the newer source data into the open review. The user chooses when, so the screen never shifts under them. */
export function refreshSnapshot(): Promise<boolean> {
  const auth = authorise('refresh snapshot');
  if ('error' in auth) return fail(auth.error);
  store.pendingSourceUpdate = false;
  const f = store.findings.find((x) => x.id === 'F-02');
  if (f) {
    f.versions = [...(f.versions ?? []), { version: f.version, date: today, currentPosition: f.currentPosition, significance: f.significance }];
    f.version += 1;
    f.currentPosition = 'Backlog 5; P-103 review booked 14 Oct';
  }
  audit(auth.user, { kind: 'snapshot refreshed', targetId: 'F-02', summary: 'Governance intake tracker update applied to the open review.' });
  return respond(true, 600);
}

/** Saves an edit. expectedRevision guards against two people editing the same draft. */
export function saveBriefing(briefing: Briefing, expectedRevision: number): Promise<Briefing> {
  const auth = authorise('prepare briefing');
  if ('error' in auth) return fail(auth.error);
  const current = store.briefings.find((b) => b.id === briefing.id);
  if (!current) return fail('Briefing not found.');
  if (current.status === 'published' || current.status === 'superseded') return fail('A published briefing cannot be edited. Start a revision instead.');
  if (current.revision !== expectedRevision) return fail(`Someone else saved this briefing (now revision ${current.revision}). Reload before saving.`);
  const saved: Briefing = { ...briefing, status: current.status, version: current.version, revision: current.revision + 1, updatedAt: `${today} 16:05` };
  store.briefings[store.briefings.indexOf(current)] = saved;
  audit(auth.user, { kind: 'briefing saved', targetId: saved.id, summary: `Revision ${saved.revision}`, inputs: { expectedRevision: String(expectedRevision) } });
  return respond(saved);
}

/** Sponsors add items to a briefing in preparation without being able to edit its narrative or publish it. */
export function addBriefingItems(id: string, sectionKey: string, itemIds: string[]): Promise<Briefing> {
  const auth = authorise('add to briefing');
  if ('error' in auth) return fail(auth.error);
  const b = store.briefings.find((x) => x.id === id);
  if (!b) return fail('Briefing not found.');
  if (b.status !== 'draft' && b.status !== 'under review') return fail('Items can only be added while the briefing is in draft or under review.');
  const section = b.sections.find((s) => s.key === sectionKey);
  if (!section) return fail('Section not found.');
  section.itemIds = [...new Set([...section.itemIds, ...itemIds])];
  b.revision += 1;
  audit(auth.user, { kind: 'briefing saved', targetId: b.id, summary: `Added ${itemIds.join(', ')} to ${section.title}`, inputs: { sectionKey, itemIds: itemIds.join(', ') } });
  return respond(b);
}

const NEXT: Partial<Record<BriefingStatus, BriefingStatus[]>> = { draft: ['under review'], 'under review': ['draft', 'approved'], approved: ['draft', 'published'] };

export function setBriefingStatus(id: string, status: BriefingStatus): Promise<Briefing> {
  const auth = authorise(status === 'published' ? 'publish briefing' : 'prepare briefing');
  if ('error' in auth) return fail(auth.error);
  const b = store.briefings.find((x) => x.id === id);
  if (!b) return fail('Briefing not found.');
  if (!NEXT[b.status]?.includes(status)) return fail(`A briefing cannot move from ${b.status} to ${status}.`);
  if (status === 'published') {
    store.briefings.filter((x) => x.id !== id && x.status === 'published' && x.audience === b.audience).forEach((x) => (x.status = 'superseded'));
    b.version += 1;
    b.published = {
      sections: structuredClone(b.sections), definitionVersions: Object.fromEntries(store.definitions.map((d) => [d.id, d.version])), publishedAt: `${today} 16:10`, publishedBy: auth.user.name,
      figures: briefingFigures(store, projectIdsInScope(b.scope), b.snapshotId),
    };
  }
  b.status = status;
  b.revision += 1;
  b.updatedAt = `${today} 16:10`;
  audit(auth.user, { kind: 'briefing status', targetId: b.id, summary: `Set to ${status}`, inputs: { status } });
  return respond(b);
}

export type NewBriefingInput = { audience: string; scope: string; period: string; templateId: string };

/** Sections come from the briefing template definition, so the portfolio office changes them without a deployment. */
export function createBriefing(input: NewBriefingInput): Promise<Briefing> {
  const auth = authorise('prepare briefing');
  if ('error' in auth) return fail(auth.error);
  const template = store.definitions.find((d) => d.id === input.templateId && d.area === 'Briefing templates');
  if (!template) return fail('Briefing template not found.');
  const titles = template.value.replace(/^Sections:\s*/i, '').replace(/\.$/, '').split(',').map((t) => t.trim()).filter(Boolean);
  const open = store.snapshots.find((s) => s.status === 'open');
  const b: Briefing = {
    id: nextId('B-N', store.briefings), audience: input.audience, scope: input.scope, period: input.period, snapshotId: open?.id ?? '', status: 'draft', version: 0, revision: 1,
    templateId: template.id, updatedAt: `${today} 16:00`,
    sections: titles.map((t) => ({ key: t.toLowerCase().replace(/[^a-z]+/g, '-'), title: t.charAt(0).toUpperCase() + t.slice(1), narrative: '', itemIds: [] })),
  };
  store.briefings.push(b);
  audit(auth.user, { kind: 'briefing created', targetId: b.id, summary: `${b.audience}, ${b.period}`, inputs: { ...input } });
  return respond(b);
}

/** Starts a new draft from a published briefing. The published version stays as it was. */
export function reviseBriefing(id: string): Promise<Briefing> {
  const auth = authorise('prepare briefing');
  if ('error' in auth) return fail(auth.error);
  const src = store.briefings.find((b) => b.id === id);
  if (!src || src.status !== 'published') return fail('Only a published briefing can be revised.');
  const base = src.id.split('-r')[0] ?? src.id;
  const n = store.briefings.filter((b) => b.id.startsWith(`${base}-r`)).length + 1;
  const draft: Briefing = { ...structuredClone(src), id: `${base}-r${n}`, status: 'draft', revision: 1, updatedAt: `${today} 16:20` };
  delete draft.published;
  store.briefings.push(draft);
  audit(auth.user, { kind: 'briefing created', targetId: draft.id, summary: `Revision of ${src.id} v${src.version}` });
  return respond(draft);
}

export function recordBriefingExport(id: string, format: 'PowerPoint' | 'Teams'): Promise<boolean> {
  const auth = authorise('add to briefing');
  if ('error' in auth) return fail(auth.error);
  audit(auth.user, { kind: 'briefing exported', targetId: id, summary: `Exported to ${format}`, inputs: { format } });
  return respond(true, 80);
}

/** Applies a definition change. The previous value is kept so past snapshots and briefings show what was in force. */
export function applyDefinition(id: string, value: string, reason: string): Promise<boolean> {
  const auth = authorise('apply definition');
  if ('error' in auth) return fail(auth.error);
  const d = store.definitions.find((x) => x.id === id);
  if (!d) return fail('Definition not found.');
  if (!reason.trim()) return fail('Record the reason for the change.');
  d.history = [...(d.history ?? []), { version: d.version, value: d.value, owner: d.owner, effectiveDate: d.effectiveDate, reason: d.reason }];
  d.value = value;
  d.reason = reason.trim();
  d.version += 1;
  d.effectiveDate = today;
  audit(auth.user, { kind: 'definition applied', targetId: d.id, summary: `Version ${d.version}: ${reason}`, inputs: { value, reason } });
  return respond(true, 500);
}
