import type { Condition, Dimension, Finding, Snapshot } from '@/shared/types/domain';
import type { SnapshotContent } from '@/shared/types/workflow';
import { sharedConstraints } from './constraints';
import { findingLifecycle, weekNo, type JourneyData } from './journey';
import { costSummary, type CostSummary } from './portfolio';

export type AssessmentLine = { key: 'progress' | 'constraints' | 'implications' | 'attention'; heading: string; text: string; refs: string[] };

const SEVERITY: Record<Condition, number> = { breached: 4, attention: 3, unknown: 2, reported: 1, met: 0 };
const gbpM = (n: number) => (n >= 1_000_000 ? `£${(n / 1_000_000).toFixed(2)}m` : `£${Math.round(n / 1000)}k`);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

/** The review window: after the previous review's date, up to and including this one's. */
export function reviewWindow(snap: Snapshot, snapshots: Snapshot[]): { from: string; to: string } {
  const earlier = snapshots.filter((s) => s.date < snap.date).sort((a, b) => b.date.localeCompare(a.date))[0];
  return { from: earlier?.date ?? '0000-01-01', to: snap.date };
}

const inWindow = (d: string | undefined, w: { from: string; to: string }) => Boolean(d && d > w.from && d <= w.to);

function progress(s: JourneyData, ids: string[], w: { from: string; to: string }): AssessmentLine {
  const done = s.commitments.filter((c) => ids.includes(c.projectId) && inWindow(c.actualDate, w));
  const released = s.releases.filter((r) => ids.includes(r.projectId) && r.events.some((e) => (e.kind === 'available' || e.kind === 'expanded') && inWindow(e.date, w)));
  const text = `${plural(done.length, 'commitment')} completed this week${done.length ? `, including ${list(done.slice(0, 2).map((c) => c.title))}` : ''}. `
    + `${plural(released.length, 'release')} reached business availability${released.length ? `, including ${list(released.slice(0, 3).map((r) => r.capability))}` : ''}.`;
  return { key: 'progress', heading: 'Material progress', text, refs: [...done.map((c) => c.id), ...released.map((r) => r.id)] };
}

function constraints(s: JourneyData, ids: string[]): AssessmentLine {
  // Reach first: a leader needs the constraint that holds the most work, then the most severe.
  const top = sharedConstraints(s).filter((c) => c.projectIds.some((p) => ids.includes(p)) && SEVERITY[c.worst] >= SEVERITY.attention)
    .sort((a, b) => b.projectIds.length - a.projectIds.length || SEVERITY[b.worst] - SEVERITY[a.worst]).slice(0, 2);
  const text = top.length
    ? top.map((c) => `${c.node.label} ${c.worst === 'breached' ? 'is breached' : 'needs attention'} and holds ${plural(c.projectIds.length, 'project')} across ${plural(c.programmeIds.length, 'programme')}${c.node.owner ? ` (owner ${c.node.owner})` : ''}.`).join(' ')
    : 'No shared constraint is causing a breach or needing attention.';
  return { key: 'constraints', heading: 'Constraints', text, refs: top.map((c) => c.node.id) };
}

function implications(s: JourneyData, ids: string[]): AssessmentLine {
  const cost = costSummary(s.costRecords, ids);
  const over = s.projects.filter((p) => ids.includes(p.id)).map((p) => ({ p, c: costSummary(s.costRecords, [p.id]) })).filter(({ c }) => c.budget > 0 && c.variance / c.budget > 0.15);
  const scopedOutcomes = s.outcomeMeasures.filter((o) => ids.includes(o.projectId));
  const measured = scopedOutcomes.filter((o) => o.actual).length;
  const forecastOnly = scopedOutcomes.length - measured;
  const text = `Forecast ${gbpM(cost.forecast)} against ${gbpM(cost.budget)} budget for ${cost.coverage} of ${cost.of} projects`
    + `${cost.sharedExcluded ? `, with ${gbpM(cost.sharedExcluded)} of shared cost excluded until finance confirms the basis` : ''}. `
    + `${over.length ? `${list(over.map(({ p, c }) => `${p.name} is ${Math.round((c.variance / c.budget) * 100)} percent over`))}. ` : ''}`
    + `${plural(measured, 'outcome is', 'outcomes are')} measured; ${plural(forecastOnly, 'benefit remains', 'benefits remain')} a forecast with no measurement yet.`;
  return { key: 'implications', heading: 'Business implications', text, refs: ['E-17', ...over.map(({ p }) => p.id)] };
}

function attention(s: JourneyData, ids: string[], asOf: string): AssessmentLine {
  const scoped = s.findings.filter((f) => f.affectedIds.some((id) => ids.includes(id) || s.commitments.some((c) => c.id === id && ids.includes(c.projectId))));
  const stage = (f: Finding) => findingLifecycle(f, s.actions, s.decisions).stage;
  const awaiting = scoped.filter((f) => stage(f) === 'awaiting response');
  const decisions = scoped.filter((f) => f.category === 'decision needed' && stage(f) !== 'resolved');
  const overdue = s.actions.filter((a) => a.status !== 'verified complete' && a.dueDate < asOf && (!a.findingId || scoped.some((f) => f.id === a.findingId)));
  const first = decisions[0] ?? awaiting[0];
  const text = `${plural(awaiting.length, 'owner response is', 'owner responses are')} outstanding, ${plural(decisions.length, 'decision is', 'decisions are')} needed and ${plural(overdue.length, 'action is', 'actions are')} overdue.`
    + `${first ? ` Most pressing: ${first.title}.` : ''}`;
  return { key: 'attention', heading: 'Attention required', text, refs: [...(first ? [first.id] : []), ...awaiting.map((f) => f.id), ...overdue.map((a) => a.id)] };
}

/**
 * The leadership assessment, assembled from records by fixed rules so every sentence can be traced to what it counts.
 * It is a calculated result, not an AI interpretation.
 */
export function portfolioAssessment(s: JourneyData, projectIds: string[], snap: Snapshot): AssessmentLine[] {
  const w = reviewWindow(snap, s.snapshots);
  return [progress(s, projectIds, w), constraints(s, projectIds), implications(s, projectIds), attention(s, projectIds, snap.date)];
}

export type SinceReview = {
  newFindingIds: string[];
  changedFindingIds: string[];
  resolvedFindingIds: string[];
  persisting: { id: string; weeks: number }[];
  worsened: { projectId: string; dimension: Dimension; from: Condition; to: Condition }[];
  improved: { projectId: string; dimension: Dimension; from: Condition; to: Condition }[];
};

/** What moved between two reviews: findings that appeared, changed, closed or stayed, and positions that got better or worse. */
export function sinceReview(s: JourneyData, from: SnapshotContent, to: SnapshotContent, toWeek: string): SinceReview {
  const before = new Map(from.findings.map((f) => [f.id, f]));
  const now = new Map(to.findings.map((f) => [f.id, f]));
  const resolved = (id: string) => {
    const f = s.findings.find((x) => x.id === id);
    return !now.has(id) || (f ? findingLifecycle(f, s.actions, s.decisions).stage === 'resolved' : false);
  };
  const moves = Object.entries(to.positions).flatMap(([pid, pos]) => (Object.keys(pos) as Dimension[]).flatMap((d) => {
    const a = from.positions[pid]?.[d];
    const b = pos[d];
    return a && a !== b ? [{ projectId: pid, dimension: d, from: a, to: b }] : [];
  }));
  return {
    newFindingIds: [...now.keys()].filter((id) => !before.has(id)),
    changedFindingIds: [...now.values()].filter((f) => before.has(f.id) && before.get(f.id)!.currentPosition !== f.currentPosition).map((f) => f.id),
    resolvedFindingIds: [...before.keys()].filter(resolved),
    persisting: [...now.keys()].filter((id) => before.has(id) && !resolved(id)).map((id) => {
      const f = s.findings.find((x) => x.id === id);
      return { id, weeks: f ? weekNo(toWeek) - weekNo(f.firstSeenWeek) + 1 : 1 };
    }).sort((a, b) => b.weeks - a.weeks),
    worsened: moves.filter((m) => SEVERITY[m.to] > SEVERITY[m.from]),
    improved: moves.filter((m) => SEVERITY[m.to] < SEVERITY[m.from]),
  };
}

export type ContributionItem = { id: string; text: string; evidenceId: string };
export type Contribution = { programmeId: string; narrative: string; released: string[]; measured: ContributionItem[]; forecast: ContributionItem[]; cost: CostSummary };

/** The business contribution story for one programme: objective, what is now usable, what has been measured, what it costs. */
export function programmeContribution(s: JourneyData, programmeId: string): Contribution | null {
  const pg = s.programmes.find((p) => p.id === programmeId);
  if (!pg) return null;
  const ids = s.projects.filter((p) => p.programmeId === programmeId).map((p) => p.id);
  const released = s.releases.filter((r) => ids.includes(r.projectId) && r.events.some((e) => e.kind === 'available' || e.kind === 'expanded') && !r.events.some((e) => e.kind === 'withdrawn'));
  const outcomes = s.outcomeMeasures.filter((o) => ids.includes(o.projectId));
  const measured = outcomes.filter((o) => o.actual).map((o) => ({ id: o.id, text: `${o.name}: ${o.actual} against a ${o.baseline} baseline`, evidenceId: o.evidenceId }));
  const forecast = outcomes.filter((o) => !o.actual).map((o) => ({ id: o.id, text: `${o.name}: forecast ${o.forecast}`, evidenceId: o.evidenceId }));
  const cost = costSummary(s.costRecords, ids);
  const narrative = `${pg.objective} `
    + `${released.length ? `So far ${plural(released.length, 'capability is', 'capabilities are')} in business use, reaching ${list([...new Set(released.flatMap((r) => r.enabledTeams))].slice(0, 3))}. ` : 'Nothing is in business use yet. '}`
    + `${measured.length ? `Measured so far: ${list(measured.map((m) => m.text))}. ` : 'No benefit has been measured yet. '}`
    + `${forecast.length ? `${plural(forecast.length, 'benefit remains', 'benefits remain')} a forecast. ` : ''}`
    + `Forecast spend is ${gbpM(cost.forecast)} against ${gbpM(cost.budget)}.`;
  return { programmeId, narrative, released: released.map((r) => r.id), measured, forecast, cost };
}

export type BriefingFigures = {
  snapshotId: string;
  cost: CostSummary;
  measuredOutcomes: number;
  forecastBenefits: number;
  unresolved: { id: string; title: string; reason: string }[];
};

/** Figures for the briefing, from the same calculations as the overview, so totals cannot drift between the two. */
export function briefingFigures(s: JourneyData, projectIds: string[], snapshotId: string): BriefingFigures {
  const inScope = (f: Finding) => f.affectedIds.some((id) => projectIds.includes(id) || s.commitments.some((c) => c.id === id && projectIds.includes(c.projectId)));
  const unresolved = s.findings.filter(inScope).flatMap((f) => {
    const l = findingLifecycle(f, s.actions, s.decisions);
    const challenged = f.responses.some((r) => r.findingVersion === f.version && r.action === 'challenged');
    if (challenged) return [{ id: f.id, title: f.title, reason: 'Challenged by the owner; conclusion not agreed.' }];
    if (l.stage === 'resolved' || l.stage === 'response recorded') return [];
    return [{ id: f.id, title: f.title, reason: l.detail }];
  });
  return {
    snapshotId, cost: costSummary(s.costRecords, projectIds),
    measuredOutcomes: s.outcomeMeasures.filter((o) => projectIds.includes(o.projectId) && o.actual).length,
    forecastBenefits: s.outcomeMeasures.filter((o) => projectIds.includes(o.projectId) && !o.actual).length,
    unresolved,
  };
}
