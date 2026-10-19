import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { EntityLink } from '@/shared/components/EntityLink';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip, type Tone } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import type { Action, Decision, Finding } from '@/shared/types/domain';
import { sentence } from './directoryModel';

type Props = { decisions: Decision[]; actions: Action[]; findings: Finding[]; onOpenFinding: (id: string) => void };

const ACTION_TONE: Record<Action['status'], Tone> = { open: 'neutral', 'in progress': 'info', blocked: 'danger', 'reported complete': 'warning', 'verified complete': 'success' };

function Group({ title, count, empty, children }: { title: string; count: number; empty: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="overline" component="h3">{title} ({count})</Typography>
      <Stack sx={{ mt: 0.75 }}>{count ? children : <Typography variant="body2" sx={{ color: 'text.secondary' }}>{empty}</Typography>}</Stack>
    </Box>
  );
}

const row = { py: 1.25, borderBottom: 1, borderColor: 'divider', display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' } as const;

/** Conclusions, actions and changes with their history, linked back to the finding that produced them. */
export function DecisionsHistory({ decisions, actions, findings, onOpenFinding }: Props) {
  const reviewed = findings.filter((f) => f.responses.length);
  return (
    <Stack sx={{ gap: 3 }}>
      <Group title="Decisions" count={decisions.length} empty="None recorded.">
        {decisions.map((d) => (
          <Box key={d.id} sx={row}>
            <Typography variant="label" sx={{ fontFamily: 'monospace', minWidth: 64 }}>{d.id}</Typography>
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.question}</Typography>
              <Typography variant="body2">{d.conclusion}</Typography>
              <Typography variant="caption">{d.decisionMaker}, {formatDate(d.date)}. Conditions: {d.conditions}. Reference <EntityLink id={d.reference} /></Typography>
            </Box>
          </Box>
        ))}
      </Group>
      <Group title="Actions" count={actions.length} empty="None recorded.">
        {actions.map((a) => (
          <Box key={a.id} sx={row}>
            <Typography variant="label" sx={{ fontFamily: 'monospace', minWidth: 64 }}>{a.id}</Typography>
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.title}</Typography>
              {a.history.length ? <Typography variant="caption">Last: {a.history[a.history.length - 1]?.note}</Typography> : null}
            </Box>
            <AvatarName name={a.owner} subtitle={`Due ${formatDate(a.dueDate)}`} size={24} />
            <StatusChip tone={ACTION_TONE[a.status]} dot={false}>{sentence(a.status)}</StatusChip>
          </Box>
        ))}
      </Group>
      <Group title="Review history" count={reviewed.length} empty="No owner responses yet.">
        {reviewed.map((f) => (
          <Box key={f.id} sx={row}>
            <Link component="button" type="button" variant="body2" sx={{ fontWeight: 600 }} onClick={() => onOpenFinding(f.id)}>{f.id}</Link>
            <Typography variant="body2" sx={{ flex: 1, minWidth: 240 }}>{f.responses.map((r) => `${sentence(r.action)} by ${r.reviewer} on ${formatDate(r.date)} (v${r.findingVersion})`).join('; ')}</Typography>
          </Box>
        ))}
      </Group>
    </Stack>
  );
}
