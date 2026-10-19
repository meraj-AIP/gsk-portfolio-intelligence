import Button from '@mui/material/Button';
import { useSearchParams } from 'react-router-dom';
import { useBriefingTray } from '@/app/context/BriefingTrayContext';
import { useAuth } from '@/features/auth/AuthContext';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { can } from '@/shared/lib/permissions';
import type { Finding, Project } from '@/shared/types/domain';
import { RequestResponseButton } from './RequestResponseButton';

/** Ask goes to the AI; the two response buttons go to people. Kept as separate buttons so the difference is visible. */
export function ProjectHeaderActions({ project, material }: { project: Project; material: Finding | undefined }) {
  const tray = useBriefingTray();
  const { user } = useAuth();
  const [, setParams] = useSearchParams();
  const [, openFinding] = useUrlParam('finding');
  // Ask opens beside the record rather than on its own page, so the question keeps its context.
  const ask = () => setParams((prev) => { const next = new URLSearchParams(prev); next.set('ask', project.id); next.set('q', 'What changed against the previous commitment?'); return next; }, { replace: true });
  return (
    <>
      <Button variant="outlined" onClick={ask}>Ask about this project</Button>
      {material ? <Button variant="outlined" onClick={() => openFinding(material.id)}>Record owner response</Button> : null}
      {material ? <RequestResponseButton findingId={material.id} defaultOwner={material.requestedOwner ?? project.owner} /> : null}
      {can(user, 'add to briefing') ? <Button variant="contained" color="secondary" disabled={tray.has(project.id)} onClick={() => tray.add(project.id)}>{tray.has(project.id) ? 'In briefing' : 'Add to briefing'}</Button> : null}
    </>
  );
}
