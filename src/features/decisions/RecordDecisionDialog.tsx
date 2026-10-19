import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useActions, useFindings, useRecordDecision } from '@/shared/api/hooks';
import type { Action } from '@/shared/types/domain';

/** A sponsor records what was decided, under what conditions, and which finding and actions it settles. */
export function RecordDecisionDialog({ onClose }: { onClose: () => void }) {
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'));
  const findings = useFindings();
  const actions = useActions();
  const record = useRecordDecision();
  const [question, setQuestion] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [conditions, setConditions] = useState('');
  const [reference, setReference] = useState('');
  const [findingId, setFindingId] = useState('');
  const [linked, setLinked] = useState<Action[]>([]);
  const submit = () => record.mutate({ question, conclusion, conditions, reference, actionIds: linked.map((a) => a.id), ...(findingId ? { findingId } : {}) });
  return (
    <Dialog open onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="sm">
      <DialogTitle>Record decision</DialogTitle>
      <DialogContent>
        {record.data ? <Alert severity="success" sx={{ mt: 1 }}>Recorded {record.data.id}.</Alert> : (
          <Stack sx={{ gap: 2, mt: 1 }}>
            <TextField label="Question decided" value={question} onChange={(e) => setQuestion(e.target.value)} required />
            <TextField label="Conclusion" value={conclusion} onChange={(e) => setConclusion(e.target.value)} multiline minRows={2} required />
            <TextField label="Conditions" value={conditions} onChange={(e) => setConditions(e.target.value)} />
            <TextField label="Authoritative reference" value={reference} onChange={(e) => setReference(e.target.value)} helperText="Minutes, approval or record that holds the decision" />
            <TextField select label="Finding" value={findingId} onChange={(e) => setFindingId(e.target.value)} disabled={!findings.data} helperText={findings.isError ? 'Findings could not be loaded.' : undefined}>
              <MenuItem value="">None</MenuItem>
              {(findings.data ?? []).map((f) => <MenuItem key={f.id} value={f.id}>{f.id}: {f.title}</MenuItem>)}
            </TextField>
            <Autocomplete multiple options={actions.data ?? []} loading={actions.isLoading} value={linked} onChange={(_, v) => setLinked(v)}
              getOptionLabel={(a) => `${a.id}: ${a.title}`} isOptionEqualToValue={(a, b) => a.id === b.id}
              renderInput={(p) => <TextField {...p} label="Actions" helperText={actions.isError ? 'Actions could not be loaded.' : undefined} />} />
          </Stack>
        )}
        {record.error ? <Alert severity="error" sx={{ mt: 2 }}>{record.error.message}</Alert> : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{record.data ? 'Close' : 'Cancel'}</Button>
        {record.data ? null : <Button variant="contained" color="secondary" disabled={!question.trim() || !conclusion.trim() || record.isPending} onClick={submit}>Record decision</Button>}
      </DialogActions>
    </Dialog>
  );
}
