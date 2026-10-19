import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useRecordBriefingExport } from '@/shared/api/hooks';
import { can } from '@/shared/lib/permissions';
import type { Briefing } from '@/shared/types/domain';
import type { BriefingExtras } from './briefingFigures';
import { exportSections, isFrozen, teamsMessage, withExtras } from './briefingRules';
import { exportPowerPoint } from './exportPowerPoint';
import type { BriefingItem } from './useBriefingItems';

type Props = { briefing: Briefing; resolve: (id: string) => BriefingItem; extras: BriefingExtras | null };

/** Exports only frozen content, so what leaves the workspace always matches a published version. */
export function BriefingExport({ briefing, resolve, extras }: Props) {
  const { user } = useAuth();
  const record = useRecordBriefingExport();
  const [teamsText, setTeamsText] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const allowed = can(user, 'add to briefing');
  const reason = !allowed ? 'Your role cannot export briefings.' : !isFrozen(briefing) ? 'Publish the briefing before exporting it.'
    // Exports wait for the calculated figures so a file never leaves without them.
    : !extras ? 'Figures for this briefing are still being calculated.' : '';
  const sections = (x: BriefingExtras) => withExtras(exportSections(briefing, resolve), x);

  const toPowerPoint = async () => {
    setError('');
    if (!extras) return;
    try {
      await exportPowerPoint(briefing, sections(extras), extras.stamp);
      await record.mutateAsync({ id: briefing.id, format: 'PowerPoint' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The PowerPoint file could not be created.');
    }
  };
  const openTeams = () => {
    setCopied(false); setError('');
    if (!extras) return;
    setTeamsText(teamsMessage(briefing, sections(extras), `${window.location.origin}/briefing?briefing=${encodeURIComponent(briefing.id)}`, extras.stamp));
  };
  const copy = async () => {
    if (!teamsText) return;
    try {
      await navigator.clipboard.writeText(teamsText);
      setCopied(true);
      await record.mutateAsync({ id: briefing.id, format: 'Teams' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Copy failed. Select the text and copy it manually.');
    }
  };

  return (
    <Stack sx={{ gap: 1 }}>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        <Button variant="outlined" disabled={Boolean(reason) || record.isPending} onClick={() => void toPowerPoint()}>Export to PowerPoint</Button>
        <Button variant="outlined" disabled={Boolean(reason)} onClick={openTeams}>Share to Teams</Button>
      </Stack>
      {reason ? <Typography variant="caption">{reason}</Typography> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {record.isError ? <Alert severity="error">{record.error.message}</Alert> : null}
      <Dialog open={teamsText !== null} onClose={() => setTeamsText(null)} fullWidth maxWidth="md">
        <DialogTitle>Teams message</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline minRows={10} value={teamsText ?? ''} slotProps={{ input: { readOnly: true } }} sx={{ mt: 1 }} />
          {copied ? <Alert severity="success" sx={{ mt: 1 }}>Copied. Paste it into the Teams channel; the link brings readers back to this briefing.</Alert> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamsText(null)}>Close</Button>
          <Button variant="contained" onClick={() => void copy()}>Copy message</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
