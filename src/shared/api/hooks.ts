import { useQuery } from '@tanstack/react-query';
import * as read from './readApi';
import * as list from './listApi';
import * as journey from './journeyApi';
import { previewDefinitionChange } from './definitionPreview';
import type { DirectoryParams } from './readApi';

export const queryKeys = {
  programmes: ['programmes'] as const,
  projects: ['projects'] as const,
  directory: (p: DirectoryParams) => ['projects', 'directory', p] as const,
  programme: (id: string) => ['programmes', id] as const,
  project: (id: string) => ['projects', id] as const,
  commitments: ['commitments'] as const,
  scopeChanges: ['scopeChanges'] as const,
  releases: ['releases'] as const,
  release: (id: string) => ['releases', id] as const,
  dependencies: ['dependencies'] as const,
  graphNodes: ['graphNodes'] as const,
  costs: ['costs'] as const,
  outcomes: ['outcomes'] as const,
  evidence: ['evidence'] as const,
  evidenceItem: (id: string) => ['evidence', id] as const,
  findings: ['findings'] as const,
  finding: (id: string) => ['findings', id] as const,
  decisions: ['decisions'] as const,
  actions: ['actions'] as const,
  briefings: ['briefings'] as const,
  definitions: ['definitions'] as const,
  snapshots: ['snapshots'] as const,
  sources: ['sources'] as const,
  pendingUpdate: ['pendingUpdate'] as const,
  conclusions: ['conclusions'] as const,
  findingPage: (p: object) => ['findings', 'page', p] as const,
  actionPage: (p: object) => ['actions', 'page', p] as const,
  decisionPage: (p: object) => ['decisions', 'page', p] as const,
  dependencyPage: (p: object) => ['dependencies', 'page', p] as const,
  clarifications: ['clarifications'] as const,
  clarificationPage: (p: object) => ['clarifications', 'page', p] as const,
  audit: (p: object) => ['audit', p] as const,
  programmeRows: (q: string, scope: string) => ['programmes', 'rows', q, scope] as const,
  snapshotContent: (id: string) => ['snapshots', 'content', id] as const,
  snapshotCompare: (a: string, b: string) => ['snapshots', 'compare', a, b] as const,
  investigations: ['investigations'] as const,
  technicalIssues: ['technicalIssues'] as const,
  resourceConstraints: ['resourceConstraints'] as const,
  capabilities: ['capabilities'] as const,
  definitionPreview: (id: string, value: string) => ['definitions', 'preview', id, value] as const,
  // Journey views derive from findings, actions and snapshots, so they share those roots for invalidation.
  findingJourney: (id: string) => ['findings', 'journey', id] as const,
  lifecycles: ['findings', 'lifecycles'] as const,
  assessment: (scope: string, snap: string) => ['snapshots', 'assessment', scope, snap] as const,
  sinceReview: (a: string, b: string) => ['snapshots', 'since', a, b] as const,
  sharedConstraints: (scope: string) => ['dependencies', 'shared', scope] as const,
  constraintTrace: (id: string) => ['dependencies', 'trace', id] as const,
  contribution: (id: string) => ['programmes', 'contribution', id] as const,
  releaseSummaries: ['releases', 'summaries'] as const,
  briefingFigures: (scope: string, snap: string) => ['briefings', 'figures', scope, snap] as const,
};

export const useProgrammes = () => useQuery({ queryKey: queryKeys.programmes, queryFn: read.getProgrammes });
export const useAllProjects = () => useQuery({ queryKey: queryKeys.projects, queryFn: read.getAllProjects });
export const useDirectory = (p: DirectoryParams) => useQuery({ queryKey: queryKeys.directory(p), queryFn: () => read.listProjects(p), placeholderData: (prev) => prev });
export const useProgramme = (id: string) => useQuery({ queryKey: queryKeys.programme(id), queryFn: () => read.getProgramme(id) });
export const useProject = (id: string) => useQuery({ queryKey: queryKeys.project(id), queryFn: () => read.getProject(id) });
export const useCommitments = () => useQuery({ queryKey: queryKeys.commitments, queryFn: read.getCommitments });
export const useScopeChanges = () => useQuery({ queryKey: queryKeys.scopeChanges, queryFn: read.getScopeChanges });
export const useReleases = () => useQuery({ queryKey: queryKeys.releases, queryFn: read.getReleases });
export const useRelease = (id: string) => useQuery({ queryKey: queryKeys.release(id), queryFn: () => read.getRelease(id) });
export const useDependencies = () => useQuery({ queryKey: queryKeys.dependencies, queryFn: read.getDependencies });
export const useGraphNodes = () => useQuery({ queryKey: queryKeys.graphNodes, queryFn: read.getGraphNodes });
export const useCostRecords = () => useQuery({ queryKey: queryKeys.costs, queryFn: read.getCostRecords });
export const useOutcomeMeasures = () => useQuery({ queryKey: queryKeys.outcomes, queryFn: read.getOutcomeMeasures });
export const useEvidenceList = () => useQuery({ queryKey: queryKeys.evidence, queryFn: read.getEvidenceList });
export const useEvidence = (id: string) => useQuery({ queryKey: queryKeys.evidenceItem(id), queryFn: () => read.getEvidence(id), enabled: Boolean(id) });
export const useFindings = () => useQuery({ queryKey: queryKeys.findings, queryFn: read.getFindings });
export const useFinding = (id: string) => useQuery({ queryKey: queryKeys.finding(id), queryFn: () => read.getFinding(id), enabled: Boolean(id) });
export const useDecisions = () => useQuery({ queryKey: queryKeys.decisions, queryFn: read.getDecisions });
export const useActions = () => useQuery({ queryKey: queryKeys.actions, queryFn: read.getActions });
export const useBriefings = () => useQuery({ queryKey: queryKeys.briefings, queryFn: read.getBriefings });
export const useDefinitions = () => useQuery({ queryKey: queryKeys.definitions, queryFn: read.getDefinitions });
export const useSnapshots = () => useQuery({ queryKey: queryKeys.snapshots, queryFn: read.getSnapshots });
/** Sources the signed-in user may see; data owners get their own only. */
export const useSources = () => useQuery({ queryKey: queryKeys.sources, queryFn: list.getVisibleSources });
export const useConclusions = () => useQuery({ queryKey: queryKeys.conclusions, queryFn: read.getConclusions });
export const usePendingUpdate = () => useQuery({ queryKey: queryKeys.pendingUpdate, queryFn: read.getPendingSourceUpdate });

const keep = { placeholderData: <T,>(prev: T | undefined) => prev };
export const useFindingPage = (p: Parameters<typeof list.listFindings>[0]) => useQuery({ queryKey: queryKeys.findingPage(p), queryFn: () => list.listFindings(p), ...keep });
export const useActionPage = (p: list.ListParams) => useQuery({ queryKey: queryKeys.actionPage(p), queryFn: () => list.listActions(p), ...keep });
export const useDecisionPage = (p: list.ListParams) => useQuery({ queryKey: queryKeys.decisionPage(p), queryFn: () => list.listDecisions(p), ...keep });
export const useDependencyPage = (p: Parameters<typeof list.listDependencies>[0]) => useQuery({ queryKey: queryKeys.dependencyPage(p), queryFn: () => list.listDependencies(p), ...keep });
export const useClarifications = () => useQuery({ queryKey: queryKeys.clarifications, queryFn: list.getClarifications });
export const useClarificationPage = (p: list.ListParams) => useQuery({ queryKey: queryKeys.clarificationPage(p), queryFn: () => list.listClarifications(p), ...keep });
export const useAuditPage = (p: Parameters<typeof list.listAudit>[0]) => useQuery({ queryKey: queryKeys.audit(p), queryFn: () => list.listAudit(p), ...keep });
export const useProgrammeRows = (q: string, scope: string) => useQuery({ queryKey: queryKeys.programmeRows(q, scope), queryFn: () => list.listProgrammeRows(q, scope), ...keep });
export const useSnapshotContent = (id: string) => useQuery({ queryKey: queryKeys.snapshotContent(id), queryFn: () => list.getSnapshotContent(id), enabled: Boolean(id) });
export const useSnapshotComparison = (fromId: string, toId: string) => useQuery({ queryKey: queryKeys.snapshotCompare(fromId, toId), queryFn: () => list.compareSnapshots(fromId, toId), enabled: Boolean(fromId && toId) });
export const useInvestigations = () => useQuery({ queryKey: queryKeys.investigations, queryFn: list.getInvestigations });
export const useTechnicalIssues = () => useQuery({ queryKey: queryKeys.technicalIssues, queryFn: list.getTechnicalIssues });
export const useResourceConstraints = () => useQuery({ queryKey: queryKeys.resourceConstraints, queryFn: list.getResourceConstraints });
export const useCapabilities = () => useQuery({ queryKey: queryKeys.capabilities, queryFn: list.getCapabilities });
export const useDefinitionPreview = (id: string, value: string) => useQuery({ queryKey: queryKeys.definitionPreview(id, value), queryFn: () => previewDefinitionChange(id, value), enabled: Boolean(id && value) });

export const useFindingJourney = (id: string) => useQuery({ queryKey: queryKeys.findingJourney(id), queryFn: () => journey.getFindingJourney(id), enabled: Boolean(id) });
export const useLifecycles = () => useQuery({ queryKey: queryKeys.lifecycles, queryFn: journey.getLifecycles });
export const usePortfolioAssessment = (scope: string, snap: string) => useQuery({ queryKey: queryKeys.assessment(scope, snap), queryFn: () => journey.getPortfolioAssessment(scope, snap), enabled: Boolean(snap) });
export const useSinceReview = (fromId: string, toId: string) => useQuery({ queryKey: queryKeys.sinceReview(fromId, toId), queryFn: () => journey.getSinceReview(fromId, toId), enabled: Boolean(fromId && toId) });
export const useSharedConstraints = (scope: string) => useQuery({ queryKey: queryKeys.sharedConstraints(scope), queryFn: () => journey.getSharedConstraints(scope) });
export const useConstraintTrace = (id: string) => useQuery({ queryKey: queryKeys.constraintTrace(id), queryFn: () => journey.getConstraintTrace(id), enabled: Boolean(id) });
export const useProgrammeContribution = (id: string) => useQuery({ queryKey: queryKeys.contribution(id), queryFn: () => journey.getProgrammeContribution(id), enabled: Boolean(id) });
export const useReleaseSummaries = () => useQuery({ queryKey: queryKeys.releaseSummaries, queryFn: journey.getReleaseSummaries });
export const useBriefingFigures = (scope: string, snap: string) => useQuery({ queryKey: queryKeys.briefingFigures(scope, snap), queryFn: () => journey.getBriefingFigures(scope, snap), enabled: Boolean(snap) });

export * from './mutations';
