import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useApplyDefinition } from '@/shared/api/hooks';
import { can } from '@/shared/lib/permissions';
import type { Definition } from '@/shared/types/domain';
import { DefinitionPreviewResult } from './DefinitionPreviewResult';

/** Preview first, then apply with a reason. Past reviews keep the version they were assessed under. */
export function ProposeDefinitionChange({ def }: { def: Definition }) {
  const { user } = useAuth();
  const apply = useApplyDefinition();
  const [proposed, setProposed] = useState(def.value);
  const [reason, setReason] = useState('');
  const [previewed, setPreviewed] = useState('');
  const canApply = can(user, 'apply definition');
  const changed = proposed.trim() !== def.value && proposed.trim().length > 0;
  const submit = () => apply.mutate({ id: def.id, value: proposed.trim(), reason: reason.trim() }, { onSuccess: () => { setReason(''); setPreviewed(''); } });

  return (
    <Stack sx={{ gap: 1.25 }}>
      <TextField label="Proposed definition" multiline minRows={3} value={proposed} onChange={(e) => { setProposed(e.target.value); setPreviewed(''); apply.reset(); }} />
      <TextField label="Reason for change" required value={reason} onChange={(e) => setReason(e.target.value)} helperText="Recorded with the new version and shown in its history." />
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        <Button variant="outlined" disabled={!changed} onClick={() => setPreviewed(proposed.trim())}>Preview effect</Button>
        <Button variant="contained" color="secondary" disabled={!canApply || previewed !== proposed.trim() || !changed || !reason.trim() || apply.isPending} onClick={submit}>Apply as v{def.version + 1}</Button>
      </Stack>
      {previewed ? <DefinitionPreviewResult id={def.id} value={previewed} /> : null}
      {!canApply ? <Typography variant="caption">Only the portfolio lead can apply a definition change. You can preview the effect.</Typography> : null}
      {apply.isSuccess ? <Alert severity="success">Applied as a new version with its reason and effective date. Closed reviews keep the version they used.</Alert> : null}
      {apply.isError ? <Alert severity="error">{apply.error.message}</Alert> : null}
    </Stack>
  );
}
