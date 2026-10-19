import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBriefingTray } from '@/app/context/BriefingTrayContext';
import { useAuth } from '@/features/auth/AuthContext';
import { useConclusions, useRecordConclusion } from '@/shared/api/hooks';
import { EntityLink } from '@/shared/components/EntityLink';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { RequestResponseDialog } from '@/shared/components/RequestDialogs';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { can } from '@/shared/lib/permissions';
import { GatedButton } from './GatedButton';
import { itemStatus, shortDate, weekLabel, type QueueItem, type ReviewPeriod } from './weekModel';

type Props = { item: QueueItem; period: ReviewPeriod; enlarged: boolean; week: string; readOnly?: boolean };

/** The item under discussion: compare versions, request a response, record a conclusion, add to briefing. */
export function SelectedItemPanel({ item, period, enlarged, week, readOnly = false }: Props) {
  const tray = useBriefingTray();
  const [, setParams] = useSearchParams();
  const { user } = useAuth();
  const canRequest = can(user, 'request response');
  const [requesting, setRequesting] = useState(false);
  const [conclusion, setConclusion] = useState('');
  const record = useRecordConclusion();
  const conclusions = useConclusions();
  const mine = (conclusions.data ?? []).filter((c) => c.itemId === item.id);
  const status = itemStatus(item, period);
  return (
    <Stack sx={{ gap: 1.5 }}>
      <Box>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="overline">{item.projectName}</Typography>
          <StatusChip tone={status.tone}>{status.text}</StatusChip>
        </Stack>
        <Typography variant={enlarged ? 'h2' : 'subtitle1'} sx={{ color: 'primary.main' }}>{item.title}</Typography>
      </Box>
      {item.owner ? <AvatarName name={item.owner} subtitle="Owner" /> : null}
      <KeyValueList items={[{ label: 'Event date', value: shortDate(item.date) }, ...(item.receivedDate && item.receivedDate !== item.date ? [{ label: 'Received', value: shortDate(item.receivedDate) }] : []), ...(item.responseDue ? [{ label: 'Response due', value: shortDate(item.responseDue) }] : []), { label: 'Previous position', value: item.previous }, { label: 'Current position', value: item.current }]} />
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        <EntityLink id={item.evidenceId} label="Compare commitment versions" />
        <EntityLink id={item.projectId} label="Open project" />
        {item.findingId ? <EntityLink id={item.findingId} label="Open finding" /> : null}
      </Stack>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        {item.findingId ? <GatedButton allowed={canRequest} reason="Only the portfolio lead requests owner responses." variant="outlined" disabled={readOnly} onClick={() => setRequesting(true)}>Request owner response</GatedButton> : null}
        <Button variant="outlined" onClick={() => setParams((prev) => { const next = new URLSearchParams(prev); next.set('ask', item.projectId); next.set('q', 'What supports the reported progress?'); return next; }, { replace: true })}>Ask</Button>
        {can(user, 'add to briefing') ? <Button variant="outlined" disabled={tray.has(item.id)} onClick={() => tray.add(item.id)}>{tray.has(item.id) ? 'In briefing' : 'Add to briefing'}</Button> : null}
      </Stack>
      <TextField label="Review conclusion" multiline minRows={2} value={conclusion} onChange={(e) => setConclusion(e.target.value)} placeholder="What the review concluded about this item" />
      <Button variant="contained" disabled={readOnly || !conclusion.trim() || record.isPending} onClick={() => record.mutate({ itemId: item.id, week, text: conclusion.trim() }, { onSuccess: () => setConclusion('') })} sx={{ alignSelf: 'flex-start' }}>Record conclusion</Button>
      {record.error ? <Alert severity="error">{record.error.message}</Alert> : null}
      {mine.map((c, i) => <Alert key={i} severity="success" variant="outlined">{weekLabel(c.week)} review conclusion by {c.reviewer}: {c.text}</Alert>)}
      {item.findingId && requesting ? <RequestResponseDialog open onClose={() => setRequesting(false)} findingId={item.findingId} defaultOwner={item.owner} /> : null}
    </Stack>
  );
}
