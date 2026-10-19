import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { ActionUpdateDialog } from '@/features/decisions/ActionUpdateDialog';
import { InlineActionForm } from '@/features/decisions/InlineActionForm';
import { InlineDecisionForm } from '@/features/decisions/InlineDecisionForm';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import type { Lifecycle } from '@/shared/lib/journey';
import { can } from '@/shared/lib/permissions';
import type { Action, Decision, Finding } from '@/shared/types/domain';
import { ACTION_TONE, capitalise } from '@/features/decisions/viewState';
import { Field, Step, muted } from './JourneyParts';

const rowSx = { py: 0.75, borderTop: 1, borderColor: 'divider' } as const;

function verification(a: Action): string {
  if (a.status === 'verified complete') return `Verified complete${a.completionEvidence ? `, evidence ${a.completionEvidence}` : ''}.`;
  if (a.status === 'reported complete') return 'Reported complete by the owner, not yet verified.';
  if (a.status === 'blocked') return `Blocked${a.blocker ? `: ${a.blocker}` : ''}.`;
  return `${a.status.charAt(0).toUpperCase()}${a.status.slice(1)}.`;
}

function carryNote(f: Finding, stage: Lifecycle): string {
  if (stage === 'resolved') return 'Resolved. It will not carry into next week\'s review.';
  return `Not resolved, so it carries into next week's review${f.persistent ? `, as it has since ${f.firstSeenWeek.replace(/^\d{4}-/, '')}` : ''}.`;
}

type Props = { f: Finding; lifecycle: { stage: Lifecycle; detail: string }; decisions: Decision[]; actions: Action[] };

export function StepResolution({ f, lifecycle, decisions, actions }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState<'decision' | 'action' | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const mayUpdate = (a: Action) => a.owner === user?.name || can(user, 'verify completion') || user?.role === 'Portfolio lead';
  const current = actions.find((a) => a.id === editing);
  return (
    <Step n={6} title="Resolution" lead={`${lifecycle.stage.charAt(0).toUpperCase()}${lifecycle.stage.slice(1)}. ${lifecycle.detail}`}>
      <Field label={`Decisions (${decisions.length})`}>
        {decisions.length ? decisions.map((d) => (
          <Box key={d.id} sx={rowSx}>
            <Typography variant="body2"><strong>{d.conclusion}</strong></Typography>
            <Typography variant="body2" sx={muted}>{d.id}, {d.question}. {d.decisionMaker}, {formatDate(d.date)}. Conditions: {d.conditions || 'none'}. Reference: {d.reference || 'not given'}.</Typography>
          </Box>
        )) : <Typography variant="body2" sx={muted}>No decision recorded.</Typography>}
      </Field>
      <Field label={`Actions (${actions.length})`}>
        {actions.length ? actions.map((a) => (
          <Stack key={a.id} direction="row" sx={{ ...rowSx, gap: 1, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.id}: {a.title}</Typography>
              <Typography variant="body2" sx={muted}>{a.owner}, due {formatDate(a.dueDate)}. {verification(a)}</Typography>
              <Box sx={{ mt: 0.5 }}><StatusChip tone={ACTION_TONE[a.status]}>{capitalise(a.status)}</StatusChip></Box>
            </Box>
            {mayUpdate(a) ? <Button variant="outlined" onClick={() => setEditing(a.id)}>Update</Button> : null}
          </Stack>
        )) : <Typography variant="body2" sx={muted}>No action assigned.</Typography>}
      </Field>
      {form === 'decision' ? <InlineDecisionForm findingId={f.id} defaultQuestion={f.title} actions={actions} onDone={() => setForm(null)} /> : null}
      {form === 'action' ? <InlineActionForm findingId={f.id} defaultOwner={f.requestedOwner ?? ''} onDone={() => setForm(null)} /> : null}
      {form ? null : (
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          {can(user, 'record decision') ? <Button variant="outlined" onClick={() => setForm('decision')}>Record decision</Button> : null}
          {can(user, 'assign action') ? <Button variant="outlined" onClick={() => setForm('action')}>Assign action</Button> : null}
        </Stack>
      )}
      <Box sx={(t) => {
        const tone = lifecycle.stage === 'resolved' ? t.palette.tint.success : t.palette.tint.warning;
        return { p: 1.25, borderRadius: 1, bgcolor: tone.bg, color: tone.fg };
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>{carryNote(f, lifecycle.stage)}</Typography>
      </Box>
      {current ? <ActionUpdateDialog key={current.id} action={current} onClose={() => setEditing(null)} /> : null}
    </Step>
  );
}
