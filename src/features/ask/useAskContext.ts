import { useAllProjects, useFinding, useGraphNodes, useProgrammes } from '@/shared/api/hooks';

export type AskContext = { label: string; contextIds: string[]; loading: boolean; error: string | null };

/**
 * Resolves ?ask=<id> to what the investigation should read. A finding is asked about through the work it affects,
 * because the investigation service scopes by programme, project and input, not by finding.
 */
export function useAskContext(about: string): AskContext {
  const isFinding = about.startsWith('F-');
  const finding = useFinding(isFinding ? about : '');
  const programmes = useProgrammes();
  const projects = useAllProjects();
  const nodes = useGraphNodes();

  if (isFinding) {
    if (finding.isLoading) return { label: about, contextIds: [], loading: true, error: null };
    if (finding.isError) return { label: about, contextIds: [], loading: false, error: finding.error.message };
    const f = finding.data;
    if (!f) return { label: `${about} (not found), whole portfolio`, contextIds: [], loading: false, error: null };
    return { label: `Finding ${f.id}, ${f.title}`, contextIds: f.affectedIds, loading: false, error: null };
  }
  if (!about || about === 'portfolio') return { label: 'Whole portfolio', contextIds: [], loading: false, error: null };

  const lists = [programmes, projects, nodes];
  if (lists.some((q) => q.isLoading)) return { label: about, contextIds: [about], loading: true, error: null };
  const name = programmes.data?.find((p) => p.id === about)?.name ?? projects.data?.find((p) => p.id === about)?.name ?? nodes.data?.find((n) => n.id === about)?.label;
  return { label: name ? `${about} ${name}` : about, contextIds: [about], loading: false, error: lists.find((q) => q.isError)?.error?.message ?? null };
}
