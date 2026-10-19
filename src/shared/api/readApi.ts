import type { Page, Project, Programme } from '@/shared/types/domain';
import { respond, store } from './store';

export type DirectoryParams = {
  q: string;
  programmeId: string;
  stage: string;
  businessArea: string;
  page: number;
  pageSize: number;
  sort: 'name' | 'owner' | 'commitment' | 'reportingDate';
};

export const DIRECTORY_DEFAULTS: DirectoryParams = { q: '', programmeId: '', stage: '', businessArea: '', page: 0, pageSize: 6, sort: 'name' };

function matchesQuery(p: Project, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const deps = store.dependencies.filter((d) => d.fromId === p.id).map((d) => d.description);
  const rels = store.releases.filter((r) => r.projectId === p.id).map((r) => r.capability);
  const hay = [p.name, p.purpose, p.owner, p.businessArea, p.commitment.label, ...deps, ...rels].join(' ').toLowerCase();
  return hay.includes(needle);
}

/** Server-style paginated directory. Filtering, sorting and slicing happen here, never in the component. */
export function listProjects(params: DirectoryParams): Promise<Page<Project>> {
  let rows = store.projects.filter((p) => matchesQuery(p, params.q));
  if (params.programmeId) rows = rows.filter((p) => p.programmeId === params.programmeId);
  if (params.stage) rows = rows.filter((p) => p.stage === params.stage);
  if (params.businessArea) rows = rows.filter((p) => p.businessArea === params.businessArea);
  rows = [...rows].sort((a, b) => {
    if (params.sort === 'owner') return a.owner.localeCompare(b.owner);
    if (params.sort === 'commitment') return a.commitment.current.localeCompare(b.commitment.current);
    if (params.sort === 'reportingDate') return b.reportingDate.localeCompare(a.reportingDate);
    return a.name.localeCompare(b.name);
  });
  const start = params.page * params.pageSize;
  return respond({ items: rows.slice(start, start + params.pageSize), total: rows.length, page: params.page, pageSize: params.pageSize });
}

export const getProgrammes = (): Promise<Programme[]> => respond(store.programmes);
export const getAllProjects = (): Promise<Project[]> => respond(store.projects);
export const getProgramme = (id: string) => respond(store.programmes.find((p) => p.id === id) ?? null);
export const getProject = (id: string) => respond(store.projects.find((p) => p.id === id) ?? null);
export const getCommitments = () => respond(store.commitments);
export const getScopeChanges = () => respond(store.scopeChanges);
export const getReleases = () => respond(store.releases);
export const getRelease = (id: string) => respond(store.releases.find((r) => r.id === id) ?? null);
export const getDependencies = () => respond(store.dependencies);
export const getGraphNodes = () => respond(store.graphNodes);
export const getCostRecords = () => respond(store.costRecords);
export const getOutcomeMeasures = () => respond(store.outcomeMeasures);
export const getEvidenceList = () => respond(store.evidence);
export const getEvidence = (id: string) => respond(store.evidence.find((e) => e.id === id) ?? null);
export const getFindings = () => respond(store.findings);
export const getFinding = (id: string) => respond(store.findings.find((f) => f.id === id) ?? null);
export const getDecisions = () => respond(store.decisions);
export const getActions = () => respond(store.actions);
export const getBriefings = () => respond(store.briefings);
export const getDefinitions = () => respond(store.definitions);
export const getSnapshots = () => respond(store.snapshots);
export const getSources = () => respond(store.sources);
export const getConclusions = () => respond(store.conclusions, 80);
export const getPendingSourceUpdate = () => respond(store.pendingSourceUpdate, 50);
