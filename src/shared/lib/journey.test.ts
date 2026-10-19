import { describe, expect, it } from 'vitest';
import { store } from '@/shared/api/store';
import { captureContent } from '@/shared/api/snapshots';
import { briefingFigures, portfolioAssessment, programmeContribution, sinceReview } from './assessment';
import { constraintTrace, releaseSummary, sharedConstraints } from './constraints';
import { findingImpact, findingImplication, findingLifecycle, findingTrail } from './journey';
import { costSummary } from './portfolio';

const s = structuredClone(store);
const finding = (id: string) => s.findings.find((f) => f.id === id)!;
const all = s.projects.map((p) => p.id);
const open = s.snapshots.find((x) => x.status === 'open')!;

describe('finding lifecycle', () => {
  it('moves from awaiting response to in resolution to resolved', () => {
    expect(findingLifecycle(finding('F-07'), s.actions, s.decisions).stage).toBe('awaiting response');
    expect(findingLifecycle(finding('F-02'), s.actions, s.decisions).stage).toBe('in resolution');
    const verified = s.actions.map((a) => (a.findingId === 'F-02' ? { ...a, status: 'verified complete' as const } : a));
    expect(findingLifecycle(finding('F-02'), verified, s.decisions).stage).toBe('resolved');
  });
});

describe('finding impact', () => {
  it('keeps reported impact and AI interpretation apart', () => {
    const facts = findingImpact(finding('F-01'), s);
    expect(facts.confirmed.map((r) => r.projectId)).toContain('P-102');
    expect(facts.confirmed.find((r) => r.projectId === 'P-102')?.commitments.map((c) => c.id)).toContain('C-03');
    const interpretation = findingImpact(finding('F-06'), s);
    expect(interpretation.inferred.map((r) => r.projectId)).toContain('P-201');
    expect(interpretation.confirmed.every((r) => r.note !== finding('F-06').currentPosition)).toBe(true);
  });

  it('states the business exposure behind a cost finding', () => {
    const imp = findingImplication(finding('F-03'), s);
    expect(imp.cost.budget).toBe(390000);
    expect(imp.forecastOutcomes.map((o) => o.id)).toContain('OM-07');
    expect(imp.summary).toMatch(/1 project in 1 programme/);
  });
});

describe('continuity', () => {
  it('traces a persistent finding through every review and a new one only from its first week', () => {
    expect(findingTrail(finding('F-01'), s.snapshots).every((p) => p.present)).toBe(true);
    expect(findingTrail(finding('F-03'), s.snapshots).filter((p) => p.present).map((p) => p.week)).toEqual(['2026-W41']);
  });

  it('reports what moved since the previous review', () => {
    const w40 = s.snapshots.find((x) => x.id === 'SNAP-W40')!.content!;
    const diff = sinceReview(s, w40, captureContent(s, 'now', 'test'), open.week);
    expect(diff.newFindingIds).toContain('F-03');
    expect(diff.worsened).toContainEqual({ projectId: 'P-302', dimension: 'cost', from: 'attention', to: 'breached' });
    expect(diff.persisting.find((p) => p.id === 'F-01')?.weeks).toBe(4);
  });
});

describe('shared constraints', () => {
  it('lists constraints worst first and traces each to its work', () => {
    const list = sharedConstraints(s);
    expect(list[0]?.worst).toBe('breached');
    expect(list.find((c) => c.node.id === 'T-GOV')?.projectIds.length).toBeGreaterThan(1);
    const trace = constraintTrace('D-CDL', s);
    expect(trace.map((r) => r.projectId).sort()).toEqual(['P-102', 'P-103']);
    expect(trace.find((r) => r.projectId === 'P-103')?.inferredExposure).toMatch(/exposed/);
  });

  it('summarises a release as planned against actual availability', () => {
    const r = releaseSummary(s.releases.find((x) => x.id === 'R-02')!);
    expect(r.availableOn).toBeDefined();
    expect(r.audience).not.toBe('No audience enabled yet');
  });
});

describe('assessment and briefing figures', () => {
  it('writes four traceable lines for the open review', () => {
    const lines = portfolioAssessment(s, all, open);
    expect(lines.map((l) => l.key)).toEqual(['progress', 'constraints', 'implications', 'attention']);
    expect(lines[0]?.text).toMatch(/^5 commitments completed this week/);
    expect(lines.every((l) => !/[\u2013\u2014]/.test(l.text))).toBe(true);
  });

  it('gives the briefing the same totals as the overview', () => {
    expect(briefingFigures(s, all, open.id).cost).toEqual(costSummary(s.costRecords, all));
    expect(briefingFigures(s, all, open.id).unresolved.map((u) => u.id)).toContain('F-07');
  });

  it('tells each programme contribution story', () => {
    expect(programmeContribution(s, 'PG-03')?.narrative).toMatch(/Measured so far: Deviation closure time/);
    expect(programmeContribution(s, 'nope')).toBeNull();
  });
});
