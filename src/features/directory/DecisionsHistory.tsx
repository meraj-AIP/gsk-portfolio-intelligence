import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Action, Decision, Finding } from '@/shared/types/domain';
import { EntityLink } from '@/shared/components/EntityLink';
import { formatDate } from '@/shared/lib/format';

type Props = { decisions: Decision[]; actions: Action[]; findings: Finding[]; onOpenFinding: (id: string) => void };

/** Conclusions, actions and changes with their history, linked back to the finding that produced them. */
export function DecisionsHistory({ decisions, actions, findings, onOpenFinding }: Props) {
  const reviewed = findings.filter((f) => f.responses.length);
  return (
    <Stack sx={{ gap: 2 }}>
      <div>
        <Typography variant="subtitle2">Decisions ({decisions.length})</Typography>
        {decisions.length === 0 ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>None recorded.</Typography> : null}
        {decisions.map((d) => <Typography key={d.id} variant="body2" sx={{ mt: 0.5 }}><strong>{d.id}</strong> {d.question} <em>{d.conclusion}</em> ({d.decisionMaker}, {formatDate(d.date)}; conditions: {d.conditions}; reference <EntityLink id={d.reference} />)</Typography>)}
      </div>
      <div>
        <Typography variant="subtitle2">Actions ({actions.length})</Typography>
        {actions.map((a) => <Typography key={a.id} variant="body2" sx={{ mt: 0.5 }}><strong>{a.id}</strong> {a.title}: {a.owner}, due {formatDate(a.dueDate)}, {a.status}{a.history.length ? `. Last: ${a.history[a.history.length - 1]?.note}` : ''}</Typography>)}
      </div>
      <div>
        <Typography variant="subtitle2">Review history</Typography>
        {reviewed.length === 0 ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>No owner responses yet.</Typography> : null}
        {reviewed.map((f) => <Typography key={f.id} variant="body2" sx={{ mt: 0.5 }}><Link component="button" type="button" onClick={() => onOpenFinding(f.id)}>{f.id}</Link> {f.responses.map((r) => `${r.action} by ${r.reviewer} on ${formatDate(r.date)} (v${r.findingVersion})`).join('; ')}</Typography>)}
      </div>
    </Stack>
  );
}
