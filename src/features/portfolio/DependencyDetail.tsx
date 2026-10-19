import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { ClarificationDialog } from '@/shared/components/RequestDialogs';
import { can, denialMessage } from '@/shared/lib/permissions';
import type { Dependency, GraphNode } from '@/shared/types/domain';
import { DependencySidePanel } from './DependencySidePanel';
import { FollowUpDialog } from './FollowUpDialog';

type Props = { dependency: Dependency; nodes: GraphNode[] };

/** Selected relationship plus what can be done about it: ask the owner, assign a follow-up, or investigate with Ask. */
export function DependencyDetail({ dependency: d, nodes }: Props) {
  const { user } = useAuth();
  const [, setParams] = useSearchParams();
  const [dialog, setDialog] = useState<'clarify' | 'follow-up' | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const canAssign = can(user, 'assign action');
  return (
    <Stack sx={{ gap: 1.5 }}>
      <DependencySidePanel dependency={d} nodes={nodes} />
      {created ? <Alert severity="success">Follow-up action {created} created.</Alert> : null}
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={() => setDialog('clarify')}>Request clarification</Button>
        <Tooltip title={canAssign || !user ? '' : denialMessage(user.role, 'assign action')}>
          <span><Button variant="outlined" onClick={() => setDialog('follow-up')} disabled={!canAssign}>Create follow-up</Button></span>
        </Tooltip>
        <Button onClick={() => setParams((prev) => { const next = new URLSearchParams(prev); next.set('ask', d.toId); next.set('q', `What depends on ${d.id} and what is exposed if it slips?`); return next; }, { replace: true })}>Ask about this</Button>
      </Stack>
      {dialog === 'clarify' ? <ClarificationDialog open onClose={() => setDialog(null)} targetId={d.id} owner={d.owner} prompt={`About ${d.id}: `} /> : null}
      {dialog === 'follow-up' ? <FollowUpDialog open onClose={() => setDialog(null)} dependency={d} onCreated={setCreated} /> : null}
    </Stack>
  );
}
