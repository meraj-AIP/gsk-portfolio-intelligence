import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { PageHeader } from '@/shared/components/PageHeader';
import { FilterChips, SegmentedToggle } from '@/shared/components/ui/Controls';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { can } from '@/shared/lib/permissions';
import { ActionsView } from './ActionsView';
import { ClarificationsView } from './ClarificationsView';
import { DecisionsKpis } from './DecisionsKpis';
import { DecisionsView } from './DecisionsView';
import { RecordDecisionDialog } from './RecordDecisionDialog';
import { ResponsesView } from './ResponsesView';
import { useWorkCounts } from './useWorkCounts';

const VIEWS = [
  { key: 'responses', label: 'Responses required', Body: ResponsesView },
  { key: 'clarifications', label: 'Clarifications', Body: ClarificationsView },
  { key: 'decisions', label: 'Decisions', Body: DecisionsView },
  { key: 'actions', label: 'Actions', Body: ActionsView },
] as const;

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/** What is waiting on the signed-in user, whatever the list filter says. */
function WaitingOnYou({ name }: { name: string }) {
  const { counts, isError } = useWorkCounts(name);
  if (isError) return <Typography variant="overline">Your open items could not be counted</Typography>;
  if (!counts) return <Typography variant="overline">Counting your open items</Typography>;
  const parts = [
    counts.responses ? plural(counts.responses, 'response') : '',
    counts.clarifications ? plural(counts.clarifications, 'clarification') : '',
    counts.openActions ? plural(counts.openActions, 'open action') : '',
  ].filter(Boolean);
  if (!parts.length) return <StatusChip tone="success">Nothing waiting on you</StatusChip>;
  return (
    <>
      <StatusChip tone="accent">Waiting on you</StatusChip>
      <Typography variant="overline" sx={{ color: 'text.primary' }}>{parts.join(', ')}{counts.overdue ? `, ${counts.overdue} overdue` : ''}</Typography>
    </>
  );
}

/** S12. Who owes what, who decided what, and whether the agreed response happened. */
export function DecisionsPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [recording, setRecording] = useState(false);
  const view = VIEWS.find((v) => v.key === params.get('view')) ?? VIEWS[0];
  const mine = params.get('all') !== '1';

  // Changing view or filter starts again at the first page; both live in the URL with the page.
  const patch = (next: Record<string, string | null>) => setParams((prev) => {
    const copy = new URLSearchParams(prev);
    copy.delete('page');
    Object.entries(next).forEach(([k, v]) => (v === null ? copy.delete(k) : copy.set(k, v)));
    return copy;
  }, { replace: true });

  return (
    <>
      <PageHeader eyebrow={user ? <WaitingOnYou name={user.name} /> : undefined} title="Decisions and actions"
        subtitle="Responses, decisions and actions are separate records linked by stable identifiers. A confirmed conclusion, an approved action and a completed action are three different events."
        actions={can(user, 'record decision') ? <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setRecording(true)}>Record decision</Button> : undefined} />
      <Stack sx={{ gap: 3 }}>
        <DecisionsKpis owner={mine ? user?.name : undefined} />
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 1.5 }}>
          <SegmentedToggle label="Decision views" options={VIEWS.map((v) => ({ value: v.key, label: v.label }))} value={view.key} onChange={(v) => patch({ view: v })} />
          <FilterChips label="Show" value={mine ? 'mine' : 'all'} onChange={(v) => patch({ all: v === 'all' ? '1' : null })}
            options={[{ value: 'mine', label: 'Assigned to me' }, { value: 'all', label: 'Everyone' }]} />
        </Stack>
        <view.Body />
      </Stack>
      {recording ? <RecordDecisionDialog onClose={() => setRecording(false)} /> : null}
    </>
  );
}
