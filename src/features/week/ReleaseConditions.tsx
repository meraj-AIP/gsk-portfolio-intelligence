import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useRecordReleaseCondition } from '@/shared/api/hooks';
import { formatDate } from '@/shared/lib/format';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { can } from '@/shared/lib/permissions';
import type { Release } from '@/shared/types/domain';
import { GatedButton } from './GatedButton';

/** Conditions are the release owner's record. Adding one or marking it met appends to the log; nothing is deleted. */
export function ReleaseConditions({ release, readOnly = false }: { release: Release; readOnly?: boolean }) {
  const allowed = can(useAuth().user, 'record release condition');
  const record = useRecordReleaseCondition();
  const [mode, setMode] = useState<'open' | 'met'>('open');
  const [text, setText] = useState('');
  const [met, setMet] = useState('');
  const condition = mode === 'open' ? text.trim() : met;
  const submit = () => record.mutate({ releaseId: release.id, condition, status: mode }, { onSuccess: () => { setText(''); setMet(''); } });
  const log = [...(release.conditionLog ?? [])].reverse();

  return (
    <Stack sx={{ gap: 1.5 }}>
      <Typography variant="overline" component="p">Outstanding conditions ({release.outstandingConditions.length})</Typography>
      {release.outstandingConditions.length ? (
        <Stack sx={{ gap: 0.5 }}>
          {release.outstandingConditions.map((c) => (
            <Stack key={c} direction="row" sx={(t) => ({ gap: 1, alignItems: 'center', px: 1, py: 0.75, borderRadius: 0.5, bgcolor: t.palette.brand.canvas })}>
              <StatusChip tone="warning" dot={false}>Open</StatusChip>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{c}</Typography>
            </Stack>
          ))}
        </Stack>
      ) : <Typography variant="body2" sx={{ color: 'text.secondary' }}>None outstanding.</Typography>}

      <Typography variant="overline" component="p" sx={{ mt: 1 }}>Record a condition</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1, alignItems: { sm: 'flex-start' } }}>
        <TextField select size="small" label="Change" value={mode} onChange={(e) => setMode(e.target.value === 'met' ? 'met' : 'open')} sx={{ minWidth: 170 }} disabled={!allowed || readOnly}>
          <MenuItem value="open">Add a condition</MenuItem>
          <MenuItem value="met" disabled={!release.outstandingConditions.length}>Mark one met</MenuItem>
        </TextField>
        {mode === 'open'
          ? <TextField size="small" label="Condition" value={text} onChange={(e) => setText(e.target.value)} sx={{ flex: 1 }} disabled={!allowed || readOnly} />
          : <TextField select size="small" label="Condition met" value={met} onChange={(e) => setMet(e.target.value)} sx={{ flex: 1 }} disabled={!allowed || readOnly}>
              {release.outstandingConditions.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>}
        <GatedButton allowed={allowed} reason="Only a project lead records release conditions." variant="contained" disabled={readOnly || !condition || record.isPending} onClick={submit}>Record</GatedButton>
      </Stack>
      {record.error ? <Alert severity="error">{record.error.message}</Alert> : null}
      {record.isSuccess ? <Alert severity="success">Recorded in the condition log.</Alert> : null}

      <Typography variant="overline" component="p" sx={{ mt: 1 }}>Condition log</Typography>
      {log.length === 0 ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>No condition changes recorded in this workspace yet.</Typography> : (
        <Stack component="ul" sx={{ m: 0, pl: 2.5, gap: 0.5 }}>
          {log.map((l, i) => (
            <Typography key={i} component="li" variant="body2">
              {formatDate(l.date)}, {l.recordedBy}: {l.status === 'met' ? 'marked met' : 'added'} &quot;{l.condition}&quot;
            </Typography>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
