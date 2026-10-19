import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useEvidence } from '@/shared/api/hooks';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { StatementFrame } from '@/shared/components/ui/Statement';
import { formatDate } from '@/shared/lib/format';
import type { Evidence } from '@/shared/types/domain';
import { EvidenceFields } from './EvidenceFields';
import { EvidenceNotices } from './EvidenceNotices';
import { FlagInconsistencyForm } from './FlagInconsistencyForm';

function metadata(e: Evidence) {
  return [
    { label: 'Source', value: e.source },
    { label: 'Owner', value: e.owner },
    { label: 'Record date', value: formatDate(e.date) },
    ...(e.eventDate ? [{ label: 'Event date', value: formatDate(e.eventDate) }] : []),
    ...(e.ingestedAt ? [{ label: 'Ingested', value: formatDate(e.ingestedAt) }] : []),
    ...(e.anchor ? [{ label: 'Anchor', value: `${e.anchor.label} (${e.anchor.status})` }] : []),
  ];
}

/** Record type, version and every limitation as tinted chips, read before the excerpt. */
function Badges({ e }: { e: Evidence }) {
  return (
    <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
      <StatusChip tone="neutral" square dot={false}>{e.type}</StatusChip>
      <StatusChip tone="neutral" dot={false}>Version {e.version}</StatusChip>
      {e.permission === 'restricted' ? <StatusChip tone="warning">Restricted</StatusChip> : null}
      {e.stale ? <StatusChip tone="warning">Stale record</StatusChip> : null}
      {e.anchor?.status === 'broken' ? <StatusChip tone="warning">Broken anchor</StatusChip> : null}
      {!e.originalAvailable ? <StatusChip tone="danger">Original unavailable</StatusChip> : null}
    </Stack>
  );
}

function EvidenceBody({ e, onClose }: { e: Evidence; onClose: () => void }) {
  const [flagging, setFlagging] = useState(false);
  const [openedOriginal, setOpenedOriginal] = useState(false);
  const restricted = e.permission === 'restricted';
  return (
    <>
      <DialogContent dividers>
        <Stack sx={{ gap: 2 }}>
          <Badges e={e} />
          <Box sx={(t) => ({ p: 1.5, borderRadius: 2, bgcolor: t.palette.brand.canvas, border: `1px solid ${t.palette.divider}` })}>
            <Typography variant="overline" component="p" sx={{ mb: 1 }}>Record metadata</Typography>
            <KeyValueList columns={3} items={metadata(e)} />
          </Box>
          <EvidenceNotices e={e} />
          {restricted ? null : (
            <>
              <StatementFrame type="reported fact" label="Reported fact, extracted excerpt (distinguishable from the original record)">
                <Typography variant="body1">&ldquo;{e.excerpt}&rdquo;</Typography>
                {e.context ? <Typography variant="caption" sx={{ display: 'block', mt: 0.75 }}>{e.context}</Typography> : null}
              </StatementFrame>
              <Typography variant="overline" component="p">Field values</Typography>
              <EvidenceFields e={e} />
            </>
          )}
          <Alert severity="info" variant="outlined">A source-supported statement is still a reported statement. Its presence in a record does not mean every underlying claim has been verified.</Alert>
          {openedOriginal ? <Alert severity="info">Opening the original record in its source system ({e.source}). Access is checked against your current permissions and the record&apos;s retention status.</Alert> : null}
          {flagging ? <FlagInconsistencyForm evidenceId={e.id} onCancel={() => setFlagging(false)} /> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" disabled={!e.originalAvailable || restricted} onClick={() => setOpenedOriginal(true)}>Open original source</Button>
        <Button variant="outlined" onClick={() => setFlagging(true)} disabled={flagging}>Flag inconsistency</Button>
        <Button variant="contained" onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  );
}

/** S10. The full record view: exact record behind a statement, with version compare, owner and limitations. */
export function EvidenceDialog() {
  const [id, setId] = useUrlParam('evidence');
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'));
  const query = useEvidence(id);
  const close = () => setId(null);
  const e = query.data;
  return (
    // Evidence opens from inside the finding and Ask panels, so it must always sit above any drawer.
    <Dialog open={Boolean(id)} onClose={close} fullScreen={fullScreen} maxWidth="md" fullWidth sx={{ zIndex: (t) => t.zIndex.modal + 1 }}>
      <DialogTitle component="div">
        <Typography variant="overline" component="p">Evidence record</Typography>
        <Typography variant="h2" component="h2">{e ? `${id}, ${e.source}` : id}</Typography>
      </DialogTitle>
      {e ? <EvidenceBody key={e.id} e={e} onClose={close} /> : (
        <>
          <DialogContent dividers>
            {query.isLoading ? <LoadingState rows={3} /> : null}
            {query.isError ? <ErrorState message={query.error.message} onRetry={() => void query.refetch()} /> : null}
            {query.isSuccess ? <Alert severity="warning">This evidence reference could not be resolved. The record may have been removed or your permissions may not cover it.</Alert> : null}
          </DialogContent>
          <DialogActions><Button variant="contained" onClick={close}>Close</Button></DialogActions>
        </>
      )}
    </Dialog>
  );
}
