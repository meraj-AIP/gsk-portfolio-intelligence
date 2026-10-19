import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { useCreateBriefing, useDefinitions } from '@/shared/api/hooks';
import type { Briefing } from '@/shared/types/domain';
import { AUDIENCES } from './briefingRules';

type Props = { open: boolean; onClose: () => void; onCreated: (b: Briefing) => void };

/** Sections come from a briefing template definition, so the portfolio office owns their order and wording. */
export function NewBriefingDialog({ open, onClose, onCreated }: Props) {
  const defs = useDefinitions();
  const create = useCreateBriefing();
  const templates = (defs.data ?? []).filter((d) => d.area === 'Briefing templates');
  const [templateId, setTemplateId] = useState('');
  const [audience, setAudience] = useState(AUDIENCES[0]!);
  const [scope, setScope] = useState('All programmes');
  const [period, setPeriod] = useState('');
  const chosen = templateId || templates[0]?.id || '';
  const submit = async () => {
    const b = await create.mutateAsync({ audience, scope: scope.trim(), period: period.trim(), templateId: chosen });
    onCreated(b);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New briefing</DialogTitle>
      <DialogContent>
        <Stack sx={{ gap: 1.5, mt: 1 }}>
          {defs.isError ? <Alert severity="error">Briefing templates could not be loaded.</Alert> : null}
          {defs.data && templates.length === 0 ? <Alert severity="warning">No briefing template is defined. Add one under Definitions.</Alert> : null}
          <TextField select label="Template" value={chosen} disabled={!templates.length} onChange={(e) => setTemplateId(e.target.value)}
            helperText={templates.find((t) => t.id === chosen)?.value ?? (defs.isLoading ? 'Loading templates' : '')}>
            {templates.map((t) => <MenuItem key={t.id} value={t.id}>{t.name} (v{t.version})</MenuItem>)}
          </TextField>
          <TextField select label="Audience" value={audience} onChange={(e) => setAudience(e.target.value)}>{AUDIENCES.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}</TextField>
          <TextField label="Scope" value={scope} onChange={(e) => setScope(e.target.value)} />
          <TextField label="Period" value={period} placeholder="For example: Week 42" onChange={(e) => setPeriod(e.target.value)} />
          {create.isError ? <Alert severity="error">{create.error.message}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!chosen || !scope.trim() || !period.trim() || create.isPending} onClick={() => void submit().catch(() => undefined)}>Create draft</Button>
      </DialogActions>
    </Dialog>
  );
}
