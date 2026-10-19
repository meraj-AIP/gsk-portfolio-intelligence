import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { queryKeys, useCreateAction, useRespondToFinding } from '@/shared/api/hooks';
import type { Finding, OwnerResponse } from '@/shared/types/domain';
import { VersionChangeNotice, type ViewedVersion } from './VersionChangeNotice';

const ACTIONS: OwnerResponse['action'][] = ['confirmed', 'revised', 'challenged', 'clarification requested', 'action assigned'];

const snapshot = (f: Finding): ViewedVersion => ({ version: f.version, currentPosition: f.currentPosition, significance: f.significance });

/** Records a response against the finding version the user read. Confirmation is not approval to change a plan or budget. */
export function OwnerResponseForm({ finding, onDone }: { finding: Finding; onDone: () => void }) {
  const { user } = useAuth();
  const reviewer = user?.name ?? 'Unknown user';
  const qc = useQueryClient();
  const respond = useRespondToFinding();
  const createAction = useCreateAction();
  const [viewed, setViewed] = useState<ViewedVersion>(() => snapshot(finding));
  const [action, setAction] = useState<OwnerResponse['action']>('confirmed');
  const [note, setNote] = useState('');
  const [actionTitle, setActionTitle] = useState('');
  const [actionOwner, setActionOwner] = useState(finding.requestedOwner ?? '');
  const [dueDate, setDueDate] = useState('2026-10-19');
  const needsReason = action === 'challenged' || action === 'revised';
  const canSubmit = action === 'action assigned' ? actionTitle.trim().length > 0 : !needsReason || note.trim().length > 0;
  const conflict = finding.version !== viewed.version;

  const submit = async (expectedVersion: number) => {
    try {
      await respond.mutateAsync({ findingId: finding.id, expectedVersion, action, note: note.trim() || `${action} by ${reviewer}` });
      if (action === 'action assigned') {
        await createAction.mutateAsync({ title: actionTitle.trim(), owner: actionOwner || 'Unassigned', dueDate, findingId: finding.id });
      }
      onDone();
    } catch {
      // A rejected write may mean the finding moved on; refetch the journey so the change shows next to the kept draft.
      await Promise.all([queryKeys.finding(finding.id), queryKeys.findingJourney(finding.id)].map((queryKey) => qc.invalidateQueries({ queryKey })));
    }
  };

  const resubmit = () => { setViewed(snapshot(finding)); void submit(finding.version); };

  return (
    <Stack sx={{ gap: 1.25 }}>
      <Typography variant="caption">Your response will be recorded against version {viewed.version} as {reviewer}.</Typography>
      {conflict ? <VersionChangeNotice viewed={viewed} current={finding} busy={respond.isPending} onResubmit={resubmit} /> : null}
      <TextField select label="Response" value={action} onChange={(e) => setAction(e.target.value as OwnerResponse['action'])}>
        {ACTIONS.map((a) => <MenuItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</MenuItem>)}
      </TextField>
      <TextField label={needsReason ? 'Reason (required)' : 'Note'} multiline minRows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      {action === 'action assigned' ? (
        <Stack sx={{ gap: 1 }}>
          <TextField label="Action" value={actionTitle} onChange={(e) => setActionTitle(e.target.value)} required />
          <Stack direction="row" sx={{ gap: 1 }}>
            <TextField label="Owner" value={actionOwner} onChange={(e) => setActionOwner(e.target.value)} fullWidth />
            <TextField label="Due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          </Stack>
        </Stack>
      ) : null}
      {respond.isError && !conflict ? <Alert severity="error">{respond.error.message} Your draft is kept.</Alert> : null}
      {createAction.isError ? <Alert severity="error">Response recorded, but the action was not created: {createAction.error.message}</Alert> : null}
      <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
        <Button onClick={onDone}>Cancel</Button>
        <Button variant="contained" disabled={!canSubmit || conflict || respond.isPending} onClick={() => void submit(viewed.version)}>
          {respond.isPending ? 'Recording' : 'Record response'}
        </Button>
      </Stack>
    </Stack>
  );
}
