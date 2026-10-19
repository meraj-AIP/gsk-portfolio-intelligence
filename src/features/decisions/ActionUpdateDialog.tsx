import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { queryKeys, useUpdateAction } from '@/shared/api/hooks';
import { formatDate } from '@/shared/lib/format';
import { can } from '@/shared/lib/permissions';
import type { Action } from '@/shared/types/domain';

const STATUSES: Action['status'][] = ['open', 'in progress', 'blocked', 'reported complete', 'verified complete'];

/** Assignment, progress, blockers and completion evidence are separate fields. Owner-reported completion is not verified completion. */
export function ActionUpdateDialog({ action, onClose }: { action: Action; onClose: () => void }) {
  const update = useUpdateAction();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [baseVersion, setBaseVersion] = useState(action.version);
  const [status, setStatus] = useState<Action['status']>(action.status);
  const [owner, setOwner] = useState(action.owner);
  const [blocker, setBlocker] = useState(action.blocker ?? '');
  const [evidence, setEvidence] = useState(action.completionEvidence ?? '');
  const [note, setNote] = useState('');
  const canVerify = can(user, 'verify completion');
  // A sponsor who does not own the action may only verify it; the write API rejects anything else.
  const canEdit = action.owner === user?.name || user?.role === 'Portfolio lead';
  const conflict = action.version !== baseVersion;
  const needsEvidence = status === 'reported complete' || status === 'verified complete';

  const save = async (expectedVersion: number) => {
    try {
      await update.mutateAsync({ id: action.id, expectedVersion, status, owner, blocker: status === 'blocked' ? blocker : '', completionEvidence: evidence, ...(note ? { note } : {}) });
      onClose();
    } catch {
      // The finding journey holds its own copy of linked actions, so refresh it too or the conflict shows stale history.
      await Promise.all([queryKeys.actions, queryKeys.findings].map((queryKey) => qc.invalidateQueries({ queryKey })));
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update {action.id}</DialogTitle>
      <DialogContent dividers>
        <Stack sx={{ gap: 1.5 }}>
          <Typography variant="body2">{action.title}</Typography>
          <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value as Action['status'])}>
            {STATUSES.map((s) => {
              const verify = s === 'verified complete';
              const allowed = verify ? canVerify : canEdit;
              return <MenuItem key={s} value={s} disabled={!allowed}>{s}{verify && !canVerify ? ' (portfolio lead or sponsor only)' : ''}{!verify && !canEdit ? ' (owner or portfolio lead only)' : ''}</MenuItem>;
            })}
          </TextField>
          <TextField label="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} disabled={!canEdit} />
          {status === 'blocked' ? <TextField label="Blocker" value={blocker} onChange={(e) => setBlocker(e.target.value)} required /> : null}
          {needsEvidence ? <TextField label="Completion evidence" value={evidence} onChange={(e) => setEvidence(e.target.value)} required helperText="Reference to the record that shows the action was done" /> : null}
          <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} multiline minRows={2} />
          <Typography variant="overline" component="p">History, version {action.version}</Typography>
          {action.history.map((h, i) => <Typography key={i} variant="body2"><strong>{formatDate(h.date)}</strong>, {h.by ?? 'not recorded'}: {h.note}</Typography>)}
          {conflict ? (
            <Alert severity="warning">Someone else updated this action while you were editing. It is now version {action.version}; the latest history is shown above. Your edits are kept. Save again to apply them on top of the latest version.</Alert>
          ) : update.error ? <Alert severity="error">{update.error.message}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="secondary" disabled={update.isPending || (status === 'blocked' && !blocker) || (needsEvidence && !evidence)}
          onClick={() => { setBaseVersion(action.version); void save(action.version); }}>
          {conflict ? `Save over version ${action.version}` : 'Save update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
