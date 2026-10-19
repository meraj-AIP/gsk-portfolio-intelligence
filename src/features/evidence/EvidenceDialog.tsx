import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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

function EvidenceBody({ e, onClose }: { e: Evidence; onClose: () => void }) {
  const [flagging, setFlagging] = useState(false);
  const [openedOriginal, setOpenedOriginal] = useState(false);
  const restricted = e.permission === 'restricted';
  return (
    <>
      <DialogContent dividers>
        <Stack sx={{ gap: 2 }}>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Chip label={e.type} />
            <Chip label={`Version ${e.version}`} variant="outlined" />
            {restricted ? <Chip label="Restricted" color="warning" /> : null}
            {e.stale ? <Chip label="Stale record" color="warning" /> : null}
            {e.anchor?.status === 'broken' ? <Chip label="Broken anchor" color="warning" /> : null}
            {!e.originalAvailable ? <Chip label="Original unavailable" color="error" /> : null}
          </Stack>
          <KeyValueList columns={3} items={metadata(e)} />
          <EvidenceNotices e={e} />
          {restricted ? null : (
            <>
              <div>
                <Typography variant="caption">Extracted excerpt (distinguishable from the original record)</Typography>
                <Typography variant="body1" sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 1.5, py: 0.5, mt: 0.5, bgcolor: 'background.default' }}>{e.excerpt}</Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>{e.context}</Typography>
              </div>
              <EvidenceFields e={e} />
            </>
          )}
          <Alert severity="info" variant="outlined">A source-supported statement is still a reported statement. Its presence in a record does not mean every underlying claim has been verified.</Alert>
          {openedOriginal ? <Alert severity="info">Opening the original record in its source system ({e.source}). Access is checked against your current permissions and the record&apos;s retention status.</Alert> : null}
          {flagging ? <FlagInconsistencyForm evidenceId={e.id} onCancel={() => setFlagging(false)} /> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={!e.originalAvailable || restricted} onClick={() => setOpenedOriginal(true)}>Open original source</Button>
        <Button onClick={() => setFlagging(true)} disabled={flagging}>Flag inconsistency</Button>
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
      <DialogTitle>Evidence {id}</DialogTitle>
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
