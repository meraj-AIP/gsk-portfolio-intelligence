import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/shared/types/workflow';

const person = (role: User['role'], name: string, extra: Partial<User> = {}): User => ({ id: name, name, email: `${name}@example.test`, role, team: 'Test', initials: 'TT', ...extra });
const LEAD = person('Portfolio lead', 'Lead Person');
const PROJECT = person('Project lead', 'Helen Osei');
const SPONSOR = person('Sponsor', 'Sponsor Person');
const FINANCE = person('Finance', 'Finance Person');
const DATA = person('Reporting or data owner', 'Data Person', { sourceIds: ['SRC-01'] });

/** Fresh store per test: the store is a module singleton, so state would leak between cases otherwise. */
async function load(as: User) {
  vi.resetModules();
  const session = await import('./session');
  session.setActor(as);
  return {
    as: session.setActor,
    store: (await import('./store')).store,
    write: await import('./writeApi'),
    review: await import('./reviewWriteApi'),
    records: await import('./recordsWriteApi'),
    list: await import('./listApi'),
    preview: await import('./definitionPreview'),
  };
}

async function settle<T>(p: Promise<T>): Promise<T> {
  const guarded = p.then((v) => ({ ok: true as const, v }), (e: unknown) => ({ ok: false as const, e }));
  await vi.runAllTimersAsync();
  const r = await guarded;
  if (r.ok) return r.v;
  throw r.e;
}

beforeEach(() => {
  vi.stubGlobal('window', globalThis);
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('weekly review', () => {
  it('closes once, freezes content and opens the next week', async () => {
    const m = await load(LEAD);
    const next = await settle(m.review.closeWeeklyReview('SNAP-W41'));
    expect(next.id).toBe('SNAP-W42');
    expect(m.store.snapshots.find((s) => s.id === 'SNAP-W41')?.content?.frozenBy).toBe('Lead Person');
    await expect(settle(m.review.closeWeeklyReview('SNAP-W41'))).rejects.toThrow(/already closed/);
    expect(m.store.snapshots.filter((s) => s.id === 'SNAP-W42')).toHaveLength(1);
  });

  it('rejects closing by a project lead', async () => {
    const m = await load(PROJECT);
    await expect(settle(m.review.closeWeeklyReview('SNAP-W41'))).rejects.toThrow(/cannot close review/);
  });

  it('amends closed reviews only', async () => {
    const m = await load(LEAD);
    await expect(settle(m.review.amendSnapshot({ snapshotId: 'SNAP-W41', recordId: 'C-03', correction: 'x', reason: 'y' }))).rejects.toThrow(/open review/);
    const snap = await settle(m.review.amendSnapshot({ snapshotId: 'SNAP-W39', recordId: 'C-03', correction: 'Date was 9 Oct', reason: 'Late register entry' }));
    expect(snap.status).toBe('amended');
    expect(snap.amendments).toHaveLength(1);
  });

  it('compares a past review with the open one', async () => {
    const m = await load(LEAD);
    const cmp = await settle(m.list.compareSnapshots('SNAP-W40', 'SNAP-W41'));
    expect(cmp?.changes).toContainEqual({ projectId: 'P-302', dimension: 'cost', from: 'attention', to: 'breached' });
  });
});

describe('findings and actions', () => {
  it('rejects a response against a stale finding version and records the actor', async () => {
    const m = await load(PROJECT);
    await expect(settle(m.write.respondToFinding({ findingId: 'F-03', expectedVersion: 0, action: 'confirmed', note: 'ok' }))).rejects.toThrow(/changed/);
    const f = await settle(m.write.respondToFinding({ findingId: 'F-03', expectedVersion: 1, action: 'confirmed', note: 'ok' }));
    expect(f.responses.at(-1)?.reviewer).toBe('Helen Osei');
    expect(m.store.audit.at(-1)).toMatchObject({ kind: 'owner response', user: 'Helen Osei', evidenceVersion: 1 });
  });

  it('limits finance to cost findings', async () => {
    const m = await load(FINANCE);
    await expect(settle(m.write.respondToFinding({ findingId: 'F-01', expectedVersion: 3, action: 'confirmed', note: 'x' }))).rejects.toThrow(/cost findings/);
  });

  it('guards action updates by version and verification by role', async () => {
    const m = await load(PROJECT);
    await expect(settle(m.write.updateAction({ id: 'A-04', expectedVersion: 1, status: 'verified complete' }))).rejects.toThrow(/cannot verify/);
    await settle(m.write.updateAction({ id: 'A-04', expectedVersion: 1, status: 'in progress' }));
    await expect(settle(m.write.updateAction({ id: 'A-04', expectedVersion: 1, status: 'blocked' }))).rejects.toThrow(/Someone else/);
  });

  it('lets only sponsors record decisions', async () => {
    const m = await load(LEAD);
    const input = { question: 'Fund it?', conclusion: 'Yes', conditions: '', reference: 'E-18', actionIds: [] };
    await expect(settle(m.write.recordDecision(input))).rejects.toThrow(/cannot record decision/);
    m.as(SPONSOR);
    expect((await settle(m.write.recordDecision(input))).decisionMaker).toBe('Sponsor Person');
  });
});

describe('briefings', () => {
  it('publishes only from approved, freezes content and blocks later edits', async () => {
    const m = await load(LEAD);
    await expect(settle(m.review.setBriefingStatus('B-W41', 'published'))).rejects.toThrow(/cannot move/);
    await settle(m.review.setBriefingStatus('B-W41', 'under review'));
    await settle(m.review.setBriefingStatus('B-W41', 'approved'));
    const pub = await settle(m.review.setBriefingStatus('B-W41', 'published'));
    expect(pub.published?.publishedBy).toBe('Lead Person');
    expect(m.store.briefings.find((b) => b.id === 'B-W40')?.status).toBe('superseded');
    await expect(settle(m.review.saveBriefing(pub, pub.revision))).rejects.toThrow(/cannot be edited/);
    expect((await settle(m.review.reviseBriefing('B-W41'))).status).toBe('draft');
  });

  it('lets a sponsor add items but not a project lead', async () => {
    const m = await load(SPONSOR);
    const b = await settle(m.review.addBriefingItems('B-W41', 'decisions', ['F-03']));
    expect(b.sections.find((s) => s.key === 'decisions')?.itemIds).toContain('F-03');
    m.as(PROJECT);
    await expect(settle(m.review.addBriefingItems('B-W41', 'decisions', ['F-04']))).rejects.toThrow(/cannot add to briefing/);
  });

  it('rejects a save from a stale revision', async () => {
    const m = await load(LEAD);
    const b = m.store.briefings.find((x) => x.id === 'B-W41')!;
    await settle(m.review.saveBriefing(structuredClone(b), b.revision));
    await expect(settle(m.review.saveBriefing(structuredClone(b), 4))).rejects.toThrow(/Someone else/);
  });
});

describe('definitions and sources', () => {
  it('keeps the previous definition version', async () => {
    const m = await load(LEAD);
    await settle(m.review.applyDefinition('DEF-02', 'Later than original by more than ten working days.', 'Align with R&D'));
    const d = m.store.definitions.find((x) => x.id === 'DEF-02')!;
    expect(d.version).toBe(2);
    expect(d.history?.[0]?.version).toBe(1);
  });

  it('calculates the effect of a threshold change', async () => {
    const m = await load(LEAD);
    const p = await settle(m.preview.previewDefinitionChange('DEF-09', 'Cost variance over 20 percent.'));
    expect(p.calculated).toBe(true);
    expect(p.after).toBeLessThan(p.before);
  });

  it('scopes data owners to their own sources', async () => {
    const m = await load(DATA);
    expect((await settle(m.list.getVisibleSources())).map((s) => s.id)).toEqual(['SRC-01']);
    await expect(settle(m.records.retryIngestion('SRC-06'))).rejects.toThrow(/outside your scope/);
  });

  it('files a flagged inconsistency against the evidence source', async () => {
    const m = await load(SPONSOR);
    const issue = await settle(m.records.flagInconsistency('E-09', 'Forecast differs from the cost centre report'));
    expect(m.store.sources.find((s) => s.id === 'SRC-03')?.issues.map((i) => i.id)).toContain(issue.id);
  });
});

describe('investigations', () => {
  it('routes a completed run to an owner as an AI interpretation', async () => {
    const m = await load(LEAD);
    const run = await settle(m.records.saveInvestigationRun({ question: 'Why?', contextIds: ['P-302'], period: 'W41', startedAt: 'now', state: 'completed', answer: 'Because', evidenceIds: ['E-09'], uncertainties: [] }));
    const f = await settle(m.records.routeInvestigationToOwner(run.id, 'Helen Osei', '2026-10-15'));
    expect(f.statementType).toBe('AI interpretation');
    expect(f.requestedOwner).toBe('Helen Osei');
  });
});
