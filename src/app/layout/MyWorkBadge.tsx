import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useNavigate } from 'react-router-dom';
import { useActions, useClarifications, useFindings } from '@/shared/api/hooks';
import { useAuth } from '@/features/auth/AuthContext';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Items waiting on the signed-in person: responses requested from them, open clarifications they own and their unclosed actions. */
export function MyWorkBadge() {
  const { user } = useAuth();
  const findings = useFindings();
  const actions = useActions();
  const clarifications = useClarifications();
  const navigate = useNavigate();
  if (!user) return null;
  const responses = (findings.data ?? []).filter((f) => f.requestedOwner === user.name && f.responses.every((r) => r.findingVersion !== f.version)).length;
  const questions = (clarifications.data ?? []).filter((c) => c.owner === user.name && c.status === 'open').length;
  const open = (actions.data ?? []).filter((a) => a.owner === user.name && a.status !== 'verified complete').length;
  const total = responses + questions + open;
  const summary = `${plural(responses, 'response')} requested, ${plural(questions, 'clarification')} to answer, ${plural(open, 'open action')}`;
  return (
    <Tooltip title={total ? summary : 'Nothing waiting on you'}>
      <IconButton aria-label={`My work. ${summary}`} onClick={() => navigate('/decisions')} sx={(t) => ({ color: t.palette.nav.muted, '&:hover': { color: t.palette.common.white, bgcolor: t.palette.nav.surface } })}>
        <Badge badgeContent={total} color="secondary" max={99}><NotificationsNoneIcon /></Badge>
      </IconButton>
    </Tooltip>
  );
}
