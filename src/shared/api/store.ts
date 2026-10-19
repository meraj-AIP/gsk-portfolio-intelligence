import { programmes, projects } from '@/mock/programmes';
import { commitments, releases, scopeChanges } from '@/mock/delivery';
import { dependencies, graphNodes } from '@/mock/dependencies';
import { costRecords, outcomeMeasures } from '@/mock/finance';
import { evidence } from '@/mock/evidence';
import { actions, decisions, findings } from '@/mock/findings';
import { briefings, definitions, snapshots, sources } from '@/mock/admin';
import {
  businessCapabilities, commitmentEnrichment, evidenceEnrichment, findingEnrichment, outcomeEnrichment, releaseReceived, resourceConstraints, technicalIssues,
} from '@/mock/workflow';
import type { Source } from '@/shared/types/domain';
import type { AuditEntry, Clarification, InvestigationRecord } from '@/shared/types/workflow';
import { seedPastSnapshots } from './snapshots';

const clone = <T>(value: T): T => structuredClone(value);

/** In-memory store standing in for the portfolio context service. Mutations change this copy only. */
export const store = {
  programmes: clone(programmes),
  projects: clone(projects),
  commitments: clone(commitments).map((c) => ({ ...c, ...commitmentEnrichment[c.id] })),
  scopeChanges: clone(scopeChanges),
  releases: clone(releases).map((r) => (releaseReceived[r.id] ? { ...r, receivedDate: releaseReceived[r.id] } : r)),
  dependencies: clone(dependencies),
  graphNodes: clone(graphNodes),
  costRecords: clone(costRecords),
  outcomeMeasures: clone(outcomeMeasures).map((o) => ({ ...o, ...outcomeEnrichment[o.id] })),
  evidence: clone(evidence).map((e) => ({ permission: 'permitted' as const, ...e, ...evidenceEnrichment[e.id] })),
  findings: clone(findings).map((f) => ({ ...f, ...findingEnrichment[f.id] })),
  decisions: clone(decisions),
  actions: clone(actions),
  briefings: clone(briefings),
  definitions: clone(definitions),
  snapshots: clone(snapshots),
  sources: clone(sources).map((s): Source => ({ ...s, issues: s.issues.map((i) => ({ status: 'open' as const, ...i })) })),
  technicalIssues: clone(technicalIssues),
  resourceConstraints: clone(resourceConstraints),
  capabilities: clone(businessCapabilities),
  audit: [] as AuditEntry[],
  clarifications: [] as Clarification[],
  investigations: [] as InvestigationRecord[],
  pendingSourceUpdate: true,
  conclusions: [] as { itemId: string; week: string; text: string; reviewer: string; date: string }[],
};

seedPastSnapshots(store);

export const LATENCY_MS = 220;

export function respond<T>(value: T, delay = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(value)), delay);
  });
}

export function fail(message: string, delay = LATENCY_MS): Promise<never> {
  return new Promise((_, reject) => {
    window.setTimeout(() => reject(new Error(message)), delay);
  });
}

export function nextId(prefix: string, existing: { id: string }[]): string {
  const max = existing.reduce((acc, item) => {
    const n = Number(item.id.split('-').pop());
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(2, '0')}`;
}

export const today = '2026-10-12';

export type Store = typeof store;
