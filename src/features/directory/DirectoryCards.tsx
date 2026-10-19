import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ProgrammeRow } from '@/shared/api/listApi';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import type { Finding, Page, Programme, Project } from '@/shared/types/domain';
import { DirectoryPager } from './DirectoryPager';
import { ProgrammeCard } from './ProgrammeCard';
import { ProjectCard } from './ProjectCard';

const grid = { display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', xl: 'repeat(3, 1fr)' } } as const;

type ProgrammeProps = { rows: ProgrammeRow[] | undefined; loading: boolean; error: boolean; onRetry: () => void; projects: Project[]; findings: Finding[] };

/** Programme tiles come from the same search as projects, so a query on an objective narrows both. */
export function ProgrammeCards({ rows, loading, error, onRetry, projects, findings }: ProgrammeProps) {
  const [, openFinding] = useUrlParam('finding');
  if (error) return <ErrorState message="Programmes could not be loaded." onRetry={onRetry} />;
  if (loading && !rows) return <LoadingState rows={3} />;
  if (!rows?.length) return <EmptyState title="No programmes match" hint="The search covers name, objective, sponsor, lead and business area." />;
  return (
    <Box sx={{ ...grid, opacity: loading ? 0.6 : 1 }}>
      {rows.map((r) => (
        <ProgrammeCard key={r.id} row={r} projects={projects.filter((p) => p.programmeId === r.id)}
          findingTitle={findings.find((f) => f.id === r.materialFindingId)?.title} onOpenFinding={openFinding} />
      ))}
    </Box>
  );
}

type ProjectProps = {
  page: Page<Project>; loading: boolean; programmes: Programme[]; findings: Finding[]; selected: string[]; onToggle: (id: string) => void;
  onPage: (n: number) => void; onSize: (n: number) => void;
};

/** One server page of projects as initiative tiles, with the same pager as the matrix. */
export function ProjectCards({ page, loading, programmes, findings, selected, onToggle, onPage, onSize }: ProjectProps) {
  return (
    <Stack sx={{ gap: 2, opacity: loading ? 0.6 : 1 }}>
      <Box sx={grid}>
        {page.items.map((p) => (
          <ProjectCard key={p.id} project={p} programmeName={programmes.find((x) => x.id === p.programmeId)?.name ?? p.programmeId}
            finding={findings.find((f) => f.affectedIds.includes(p.id))} selected={selected.includes(p.id)} onToggle={onToggle} />
        ))}
      </Box>
      <Paper sx={{ borderRadius: 2 }}><DirectoryPager page={page} onPage={onPage} onSize={onSize} /></Paper>
    </Stack>
  );
}

export function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h2">{title}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>{subtitle}</Typography>
    </Box>
  );
}
