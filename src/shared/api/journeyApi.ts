import { briefingFigures, portfolioAssessment, programmeContribution, sinceReview } from '@/shared/lib/assessment';
import { constraintTrace, releaseSummary, sharedConstraints } from '@/shared/lib/constraints';
import { findingImpact, findingImplication, findingLifecycle, findingTrail, type Lifecycle } from '@/shared/lib/journey';
import { projectIdsInScope } from './listApi';
import { captureContent } from './snapshots';
import { respond, store, today } from './store';

/** Everything the six-step finding journey needs, in one read: change, impact, implication, evidence, response, resolution. */
export function getFindingJourney(id: string) {
  const f = store.findings.find((x) => x.id === id);
  if (!f) return respond(null);
  const impact = findingImpact(f, store);
  return respond({
    finding: f,
    lifecycle: findingLifecycle(f, store.actions, store.decisions),
    impact,
    implication: findingImplication(f, store, impact),
    trail: findingTrail(f, store.snapshots),
    evidence: store.evidence.filter((e) => f.evidenceIds.includes(e.id)),
    decisions: store.decisions.filter((d) => d.findingId === f.id),
    actions: store.actions.filter((a) => a.findingId === f.id),
  });
}

/** Lifecycle stage per finding, for lists and badges. */
export function getLifecycles() {
  return respond(Object.fromEntries(store.findings.map((f) => [f.id, findingLifecycle(f, store.actions, store.decisions)])) as Record<string, { stage: Lifecycle; detail: string }>);
}

const snapshotOrOpen = (id: string) => store.snapshots.find((s) => s.id === id) ?? store.snapshots.find((s) => s.status === 'open');
const contentOf = (id: string) => {
  const snap = store.snapshots.find((s) => s.id === id);
  return snap?.content ?? captureContent(store, `${today} live`, 'Live');
};

export function getPortfolioAssessment(scope: string, snapshotId: string) {
  const snap = snapshotOrOpen(snapshotId);
  return respond(snap ? portfolioAssessment(store, projectIdsInScope(scope), snap) : []);
}

export function getSinceReview(fromId: string, toId: string) {
  const to = snapshotOrOpen(toId);
  if (!to || !store.snapshots.some((s) => s.id === fromId)) return respond(null);
  return respond(sinceReview(store, contentOf(fromId), contentOf(to.id), to.week));
}

export function getSharedConstraints(scope: string) {
  const ids = projectIdsInScope(scope);
  return respond(sharedConstraints(store).filter((c) => c.projectIds.some((p) => ids.includes(p))));
}

export const getConstraintTrace = (nodeId: string) => respond(constraintTrace(nodeId, store));
export const getProgrammeContribution = (id: string) => respond(programmeContribution(store, id));
export const getReleaseSummaries = () => respond(store.releases.map(releaseSummary));

export function getBriefingFigures(scope: string, snapshotId: string) {
  return respond(briefingFigures(store, projectIdsInScope(scope), snapshotId));
}
