import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useBriefingTray } from '@/app/context/BriefingTrayContext';
import { useAddBriefingItems, useSnapshots } from '@/shared/api/hooks';
import { SectionCard } from '@/shared/components/SectionCard';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { can } from '@/shared/lib/permissions';
import type { Briefing } from '@/shared/types/domain';
import { AUDIENCES, shownSections } from './briefingRules';
import type { BriefingItem } from './useBriefingItems';

type Props = { draft: Briefing; editable: boolean; resolve: (id: string) => BriefingItem; onChange: (b: Briefing) => void };

/** Left column: audience and scope controls, the add-to-briefing tray, and the evidence behind every item. */
export function BriefingControls({ draft, editable, resolve, onChange }: Props) {
  const { user } = useAuth();
  const snapshots = useSnapshots();
  const tray = useBriefingTray();
  const [target, setTarget] = useState(draft.sections[0]?.key ?? '');
  const add = useAddBriefingItems();
  const preparer = can(user, 'prepare briefing');
  const inPreparation = draft.status === 'draft' || draft.status === 'under review';
  // Preparers edit the local draft and save it; contributors such as sponsors write the items straight to the briefing.
  const canAdd = preparer ? editable : inPreparation && can(user, 'add to briefing');
  const addTray = () => {
    if (!preparer) {
      add.mutate({ id: draft.id, sectionKey: target, itemIds: tray.ids }, { onSuccess: (saved) => { onChange(saved); tray.clear(); } });
      return;
    }
    onChange({ ...draft, sections: draft.sections.map((s) => (s.key === target ? { ...s, itemIds: [...new Set([...s.itemIds, ...tray.ids])] } : s)) });
    tray.clear();
  };
  const items = shownSections(draft).flatMap((s) => s.itemIds).map(resolve);

  return (
    <Stack sx={{ gap: 2 }}>
      <SectionCard title="Controls" subtitle="Audience, scope, period and snapshot decide what can be shown.">
        <Stack sx={{ gap: 1.25 }}>
          <TextField select label="Audience" value={draft.audience} disabled={!editable} onChange={(e) => onChange({ ...draft, audience: e.target.value })}>{AUDIENCES.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}</TextField>
          <TextField label="Scope" value={draft.scope} disabled={!editable} onChange={(e) => onChange({ ...draft, scope: e.target.value })} />
          <TextField label="Period" value={draft.period} disabled={!editable} onChange={(e) => onChange({ ...draft, period: e.target.value })} />
          <TextField select label="Snapshot" value={draft.snapshotId} disabled={!editable} onChange={(e) => onChange({ ...draft, snapshotId: e.target.value })}>
            {(snapshots.data ?? [{ id: draft.snapshotId, label: draft.snapshotId }]).map((s) => <MenuItem key={s.id} value={s.id}>{s.label}</MenuItem>)}
          </TextField>
        </Stack>
      </SectionCard>
      <SectionCard title="Selected for briefing" badge={String(tray.ids.length)}>
        {tray.ids.length === 0 ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>Use Add to briefing on findings, releases, projects or investigation results. They collect here.</Typography> : (
          <Stack sx={{ gap: 1 }}>
            {tray.ids.map((id) => <Typography key={id} variant="body2">{resolve(id).label}</Typography>)}
            <TextField select label="Add to section" value={target} onChange={(e) => setTarget(e.target.value)}>{draft.sections.map((s) => <MenuItem key={s.key} value={s.key}>{s.title}</MenuItem>)}</TextField>
            <Button variant="contained" color="secondary" disabled={!canAdd || !target || add.isPending} onClick={addTray}>Add {tray.ids.length} item{tray.ids.length === 1 ? '' : 's'}</Button>
            {!editable && can(user, 'prepare briefing') ? <Typography variant="caption">This briefing is not open for changes. Pick a draft or start a revision.</Typography> : null}
            {!preparer && can(user, 'add to briefing') ? <Typography variant="caption">Items you add are saved to the briefing straight away. Editing and publishing stay with the portfolio lead.</Typography> : null}
            {!can(user, 'add to briefing') ? <Typography variant="caption">Your role cannot add items to a briefing.</Typography> : null}
            {add.error ? <Alert severity="error">{add.error.message}</Alert> : null}
          </Stack>
        )}
      </SectionCard>
      <SectionCard title="Evidence and review status" badge={`${items.length} item${items.length === 1 ? '' : 's'}`} subtitle="Pending owner responses are included with their status shown, as the reporting rules allow.">
        {items.length === 0 ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>No items in this briefing yet.</Typography> : (
          <Stack>
            {items.map((it) => (
              <Box key={it.id} sx={(t) => ({ py: 1, borderTop: `1px solid ${t.palette.divider}` })}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{it.id}</Typography>
                  <StatusChip tone={it.evidenceIds.length ? 'neutral' : 'warning'} dot={false}>
                    {it.evidenceIds.length ? `${it.evidenceIds.length} evidence ref${it.evidenceIds.length === 1 ? '' : 's'}` : 'No evidence attached'}
                  </StatusChip>
                </Stack>
                <Typography variant="caption" component="p">{it.reviewStatus}</Typography>
              </Box>
            ))}
          </Stack>
        )}
      </SectionCard>
    </Stack>
  );
}
