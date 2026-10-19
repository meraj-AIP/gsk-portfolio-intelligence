import Stack from '@mui/material/Stack';
import { AuditTable } from './AuditTable';
import { InvestigationRuns } from './InvestigationRuns';

/** Who changed what, when, in which role, and on which evidence version. Hosted as a tab of Sources and quality. */
export function AuditTrail() {
  return (
    <Stack sx={{ gap: 3 }}>
      <AuditTable />
      <InvestigationRuns />
    </Stack>
  );
}
