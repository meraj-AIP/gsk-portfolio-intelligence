import { useActions, useAllProjects, useCommitments, useFindings, useInvestigations, useProgrammes, useReleases } from '@/shared/api/hooks';

export type BriefingItem = {
  id: string;
  kind: 'finding' | 'commitment' | 'release' | 'action' | 'project' | 'programme' | 'investigation';
  label: string;
  evidenceIds: string[];
  reviewStatus: string;
  audienceRestricted?: boolean;
  /** Set for AI interpretation that no owner has substantiated yet. It never counts as support for a narrative. */
  needsSubstantiation?: boolean;
  detail?: string;
};

export const INTERPRETATION_STATUS = 'AI interpretation, not yet supported';

/** Resolves any item ID the briefing can carry into a label, its evidence and its review status. */
export function useBriefingItems(): { resolve: (id: string) => BriefingItem; ready: boolean } {
  const findings = useFindings();
  const commitments = useCommitments();
  const releases = useReleases();
  const actions = useActions();
  const projects = useAllProjects();
  const programmes = useProgrammes();
  const investigations = useInvestigations();
  const ready = Boolean(findings.data && commitments.data && releases.data && actions.data && projects.data && programmes.data);
  const resolve = (id: string): BriefingItem => {
    const f = findings.data?.find((x) => x.id === id);
    if (f) {
      const current = f.responses.filter((r) => r.findingVersion === f.version);
      const status = current.length ? `Owner ${current[current.length - 1]?.action}` : f.requestedOwner ? `Awaiting ${f.requestedOwner}` : 'No response requested';
      const interpretation = f.statementType === 'AI interpretation' && current.length === 0;
      return {
        id, kind: 'finding', label: f.title, evidenceIds: f.evidenceIds, audienceRestricted: f.category === 'cost concern',
        reviewStatus: interpretation ? `${INTERPRETATION_STATUS}; ${status.toLowerCase()}` : status, ...(interpretation ? { needsSubstantiation: true } : {}),
      };
    }
    const c = commitments.data?.find((x) => x.id === id);
    if (c) return { id, kind: 'commitment', label: `${c.title} (${c.status})`, evidenceIds: [c.evidenceId], reviewStatus: 'Reported by owner' };
    const r = releases.data?.find((x) => x.id === id);
    if (r) return { id, kind: 'release', label: r.capability, evidenceIds: [r.evidenceId], reviewStatus: r.events.some((e) => e.kind === 'available') ? 'Availability recorded' : 'Not yet available' };
    const a = actions.data?.find((x) => x.id === id);
    if (a) return { id, kind: 'action', label: `${a.title} (${a.owner}, ${a.status})`, evidenceIds: a.completionEvidence ? ['owner record'] : [], reviewStatus: a.status };
    const p = projects.data?.find((x) => x.id === id);
    if (p) return { id, kind: 'project', label: `${p.name}: ${p.commitment.label}`, evidenceIds: [], reviewStatus: p.freshness === 'current' ? 'Reported this week' : 'Stale or missing update' };
    const pg = programmes.data?.find((x) => x.id === id);
    if (pg) return { id, kind: 'programme', label: `${pg.name}: ${pg.assessment}`, evidenceIds: [], reviewStatus: 'Programme assessment' };
    if (id.startsWith('INV-')) {
      const run = investigations.data?.find((x) => x.id === id);
      return {
        id, kind: 'investigation', label: run ? run.question : `Investigation result ${id}`, evidenceIds: run?.evidenceIds ?? [],
        reviewStatus: INTERPRETATION_STATUS, needsSubstantiation: true, ...(run?.answer ? { detail: run.answer } : {}),
      };
    }
    return { id, kind: 'finding', label: id, evidenceIds: [], reviewStatus: 'Unknown' };
  };
  return { resolve, ready };
}
