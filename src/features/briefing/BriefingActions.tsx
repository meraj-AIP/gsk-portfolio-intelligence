import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/features/auth/AuthContext';
import { can } from '@/shared/lib/permissions';
import type { Briefing, BriefingStatus } from '@/shared/types/domain';
import { MOVES } from './briefingRules';

type Props = {
  briefing: Briefing; editable: boolean; busy: boolean; preview: boolean;
  onTogglePreview: () => void; onSave: () => void; onMove: (to: BriefingStatus) => void; onNew: () => void;
};

/** Header buttons. Only moves the write API allows from this status are offered, and only to roles that hold them. */
export function BriefingActions({ briefing, editable, busy, preview, onTogglePreview, onSave, onMove, onNew }: Props) {
  const { user } = useAuth();
  const canPrepare = can(user, 'prepare briefing');
  const moves = (MOVES[briefing.status] ?? []).filter((m) => can(user, m.capability));
  return (
    <Stack sx={{ gap: 0.5, alignItems: { md: 'flex-end' } }}>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        {canPrepare ? <Button variant="outlined" onClick={onNew}>New briefing</Button> : null}
        {editable ? <Button variant="outlined" onClick={onTogglePreview}>{preview ? 'Edit' : 'Preview'}</Button> : null}
        {editable ? <Button variant="outlined" disabled={busy} onClick={onSave}>Save draft</Button> : null}
        {moves.map((m) => <Button key={m.to} variant={m.primary ? 'contained' : 'outlined'} color={m.primary ? 'secondary' : 'primary'} disabled={busy} onClick={() => onMove(m.to)}>{m.label}</Button>)}
      </Stack>
      {!canPrepare ? <Typography variant="caption">Only the portfolio lead prepares, approves and publishes briefings. You can read and add items.</Typography> : null}
    </Stack>
  );
}
