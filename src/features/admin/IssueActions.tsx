import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useRequestCorrection, useResolveSourceIssue } from '@/shared/api/hooks';
import { can, type Capability } from '@/shared/lib/permissions';
import type { Source, SourceIssue } from '@/shared/types/domain';
import { candidateValues, issueKind } from './sourceIssues';

type Mode = 'mapping' | 'reconciliation' | 'correction';
const MODES: { mode: Mode; label: string; capability: Capability }[] = [
  { mode: 'mapping', label: 'Confirm mapping', capability: 'confirm mapping' },
  { mode: 'reconciliation', label: 'Record reconciliation decision', capability: 'record reconciliation' },
  { mode: 'correction', label: 'Request correction', capability: 'request correction' },
];

type Props = { source: Source; issue: SourceIssue };

/** Three separate decisions, each recorded with its own type and audit kind rather than as free text on the issue. */
export function IssueActions({ source, issue }: Props) {
  const { user } = useAuth();
  const resolve = useResolveSourceIssue();
  const correction = useRequestCorrection();
  const [mode, setMode] = useState<Mode>(issueKind(issue) === 'mapping' ? 'mapping' : 'reconciliation');
  const [note, setNote] = useState('');
  const [stands, setStands] = useState('');
  const options = candidateValues(issue);
  const current = MODES.find((m) => m.mode === mode)!;
  const allowed = can(user, current.capability);
  const busy = resolve.isPending || correction.isPending;

  const decision = mode === 'reconciliation'
    ? `${stands.trim()} stands${issue.fieldAuthority ? ` (authority: ${issue.fieldAuthority})` : ''}.${note.trim() ? ` ${note.trim()}` : ''}`
    : note.trim();
  const ready = mode === 'reconciliation' ? Boolean(stands.trim()) : Boolean(note.trim());
  const submit = () => {
    const ids = { sourceId: source.id, issueId: issue.id };
    const done = { onSuccess: () => { setNote(''); setStands(''); } };
    if (mode === 'correction') correction.mutate({ ...ids, note: note.trim() }, done);
    else resolve.mutate({ ...ids, decision, type: mode }, done);
  };
  const error = resolve.error?.message ?? correction.error?.message;

  return (
    <Stack sx={{ gap: 1 }}>
      <ToggleButtonGroup exclusive size="small" value={mode} onChange={(_, v: Mode | null) => { if (v) setMode(v); }} sx={{ flexWrap: 'wrap' }}>
        {MODES.map((m) => <ToggleButton key={m.mode} value={m.mode}>{m.label}</ToggleButton>)}
      </ToggleButtonGroup>
      {mode === 'mapping' ? <Typography variant="caption">Confirm how this source's field maps to the portfolio record. The source system itself is not changed.</Typography> : null}
      {mode === 'reconciliation' ? (
        <>
          <Typography variant="caption">Name which source's value stands. A newer value never overrides an authoritative one; the other value is kept with its provenance.</Typography>
          {options.length > 1
            ? <TextField select label="Value that stands" value={stands} onChange={(e) => setStands(e.target.value)}>{options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}</TextField>
            : <TextField label="Source whose value stands" value={stands} onChange={(e) => setStands(e.target.value)} placeholder={source.name} />}
        </>
      ) : null}
      {mode === 'correction' ? <Typography variant="caption">Asks {issue.reconciliationOwner} to correct the value at source. The issue stays open until it is resolved.</Typography> : null}
      <TextField label={mode === 'reconciliation' ? 'Reason (optional)' : mode === 'mapping' ? 'Mapping confirmed' : 'What needs correcting'} value={note} onChange={(e) => setNote(e.target.value)} multiline minRows={2} />
      <Button variant="contained" disabled={!allowed || !ready || busy} onClick={submit} sx={{ alignSelf: 'flex-start' }}>{current.label}</Button>
      {!allowed ? <Typography variant="caption">The {user?.role ?? 'signed out'} role cannot {current.capability}.</Typography> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {resolve.isSuccess || correction.isSuccess ? <Alert severity="success">Recorded with provenance. The source system itself is not changed from here; that needs the separately authorised integration.</Alert> : null}
    </Stack>
  );
}
