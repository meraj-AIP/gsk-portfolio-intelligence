import Button from '@mui/material/Button';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/shared/lib/permissions';
import Stack from '@mui/material/Stack';
import { useSearchParams } from 'react-router-dom';
import { useBriefingTray } from '@/app/context/BriefingTrayContext';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import type { Finding, Project } from '@/shared/types/domain';
import { RequestResponseButton } from './RequestResponseButton';

/** Ask goes to the AI; the two response buttons go to people. Kept as separate buttons so the difference is visible. */
export function ProjectHeaderActions({ project, material }: { project: Project; material: Finding | undefined }) {
  const tray = useBriefingTray();
  const { user } = useAuth();
  const [, setParams] = useSearchParams();
  // Ask opens beside the record rather than on its own page, so the question keeps its context.
  const ask = () => setParams((prev) => { const next = new URLSearchParams(prev); next.set('ask', project.id); next.set('q', 'What changed against the previous commitment?'); return next; }, { replace: true });
  const [, openFinding] = useUrlParam('finding');
  return (
    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
      <Button variant="contained" onClick={ask}>Ask about this project</Button>
      {can(user, 'add to briefing') ? <Button variant="outlined" disabled={tray.has(project.id)} onClick={() => tray.add(project.id)}>{tray.has(project.id) ? 'In briefing' : 'Add to briefing'}</Button> : null}
      {material ? <Button variant="outlined" onClick={() => openFinding(material.id)}>Record owner response</Button> : null}
      {material ? <RequestResponseButton findingId={material.id} defaultOwner={material.requestedOwner ?? project.owner} /> : null}
    </Stack>
  );
}
