import Stack from '@mui/material/Stack';
import { SectionCard } from '@/shared/components/SectionCard';
import { AuditTable } from './AuditTable';
import { InvestigationRuns } from './InvestigationRuns';

/** Who changed what, when, in which role, and on which evidence version. Hosted as a tab of Sources and quality. */
export function AuditTrail() {
  return (
    <Stack sx={{ gap: 2 }}>
      <SectionCard title="Changes"><AuditTable /></SectionCard>
      <SectionCard title="Investigation runs"><InvestigationRuns /></SectionCard>
    </Stack>
  );
}
