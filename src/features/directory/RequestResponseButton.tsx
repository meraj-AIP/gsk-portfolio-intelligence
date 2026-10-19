import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { RequestResponseDialog } from '@/shared/components/RequestDialogs';
import { can, denialMessage } from '@/shared/lib/permissions';

type Props = { findingId: string; defaultOwner: string };

/** Asks a named owner to respond to a material finding. Disabled with the reason when the role lacks the grant. */
export function RequestResponseButton({ findingId, defaultOwner }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const allowed = can(user, 'request response');
  return (
    <>
      <Tooltip title={allowed || !user ? '' : denialMessage(user.role, 'request response')}>
        <span><Button variant="outlined" disabled={!allowed} onClick={() => setOpen(true)}>Request owner response</Button></span>
      </Tooltip>
      {open ? <RequestResponseDialog open onClose={() => setOpen(false)} findingId={findingId} defaultOwner={defaultOwner} /> : null}
    </>
  );
}
