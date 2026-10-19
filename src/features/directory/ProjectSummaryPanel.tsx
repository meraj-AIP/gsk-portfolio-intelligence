import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useFindings, useProject } from '@/shared/api/hooks';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { DIMENSIONS } from '@/shared/types/domain';

/** Opens essential context in place and keeps the directory view underneath it. */
export function ProjectSummaryPanel({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const project = useProject(projectId);
  const findings = useFindings();
  const [, openFinding] = useUrlParam('finding');
  if (project.isError) return <ErrorState message="Project summary could not be loaded." onRetry={() => void project.refetch()} />;
  if (project.isLoading) return <LoadingState rows={4} />;
  const p = project.data;
  if (!p) return <EmptyState title="Project not found" />;
  const fs = (findings.data ?? []).filter((f) => f.affectedIds.includes(p.id));
  return (
    <Stack sx={{ gap: 1.25, mt: 1 }}>
      <Typography variant="subtitle1">{p.name}</Typography>
      <Typography variant="body2">{p.purpose}</Typography>
      <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>{DIMENSIONS.map((d) => <ConditionChip key={d} condition={p.position[d]} label={`${d.charAt(0).toUpperCase() + d.slice(1)}: ${p.position[d]}`} compact />)}</Stack>
      <KeyValueList items={[{ label: 'Owner', value: p.owner }, { label: 'Stage', value: p.stage }, { label: 'Current commitment', value: `${p.commitment.label}, ${p.commitment.actual ? `done ${p.commitment.actual}` : `due ${p.commitment.current}`}` }, { label: 'Funding', value: p.funding.map((f) => `${f.businessUnit} ${f.percent}%`).join('; ') }]} />
      <Typography variant="caption">Findings ({fs.length})</Typography>
      {fs.map((f) => <Button key={f.id} variant="text" sx={{ justifyContent: 'flex-start', textAlign: 'left' }} onClick={() => openFinding(f.id)}>{f.title}</Button>)}
      <Button onClick={onClose} sx={{ alignSelf: 'flex-start' }}>Close summary</Button>
    </Stack>
  );
}
