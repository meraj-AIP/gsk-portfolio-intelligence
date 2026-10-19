import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { RequestResponseDialog } from '@/shared/components/RequestDialogs';
import { formatDate } from '@/shared/lib/format';
import { can } from '@/shared/lib/permissions';
import type { Evidence, Finding } from '@/shared/types/domain';
import type { User } from '@/shared/types/workflow';
import { Step } from './JourneyParts';
import { OwnerResponseForm } from './OwnerResponseForm';
import { ResponseHistory } from './ResponseHistory';

/** Mirrors the write API so the button explains itself instead of failing on submit. */
function responseBlockedReason(user: User | null, f: Finding): string | null {
  if (!can(user, 'respond to finding')) return `The ${user?.role ?? 'signed-out'} role cannot respond to findings.`;
  if (user?.role === 'Finance' && f.category !== 'cost concern') return 'Finance responds to cost findings only.';
  return null;
}

function requestLine(f: Finding): string {
  if (!f.requestedOwner) return 'No owner response has been requested yet.';
  const current = f.responses.some((r) => r.findingVersion === f.version);
  return `Requested from ${f.requestedOwner}${f.dueDate ? `, due ${formatDate(f.dueDate)}` : ''}. ${current ? 'Answered against the current version.' : 'Not yet answered against the current version.'}`;
}

export function StepResponse({ f, evidence }: { f: Finding; evidence: Evidence[] }) {
  const { user } = useAuth();
  const [responding, setResponding] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const blocked = responseBlockedReason(user, f);
  return (
    <Step n={5} title="Accountable response" lead={requestLine(f)}>
      <ResponseHistory f={f} evidence={evidence} />
      {responding ? <OwnerResponseForm key={f.id} finding={f} onDone={() => setResponding(false)} /> : (
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" disabled={Boolean(blocked)} onClick={() => setResponding(true)}>Record response</Button>
          {can(user, 'request response') ? <Button variant="outlined" onClick={() => setRequesting(true)}>{f.requestedOwner ? 'Change owner request' : 'Request owner response'}</Button> : null}
        </Stack>
      )}
      {blocked && !responding ? <Typography variant="caption">{blocked}</Typography> : null}
      <Typography variant="caption">Confirming records your conclusion against this evidence version. It does not approve a change to a plan, budget or source system.</Typography>
      {requesting ? <RequestResponseDialog open onClose={() => setRequesting(false)} findingId={f.id} defaultOwner={f.requestedOwner ?? ''} /> : null}
    </Step>
  );
}
