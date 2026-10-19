import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState } from '@/shared/components/StatePanels';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import { can } from '@/shared/lib/permissions';
import type { Snapshot } from '@/shared/types/governance';
import { AmendDialog } from './AmendDialog';
import { GatedButton } from './GatedButton';

/** Closed reviews, newest first, with every amendment recorded against them. Nothing here edits the frozen content. */
export function PastReviews({ snapshots }: { snapshots: Snapshot[] }) {
  const allowed = can(useAuth().user, 'amend snapshot');
  const [amending, setAmending] = useState<Snapshot | null>(null);
  const past = snapshots.filter((s) => s.status !== 'open').sort((a, b) => b.date.localeCompare(a.date));
  return (
    <SectionCard title="Past reviews" badge={String(past.length)} subtitle="Closed snapshots stay frozen; corrections are recorded beside them.">
      {past.length === 0 ? <EmptyState title="No closed reviews yet" hint="A review appears here once it is closed." /> : (
        <Stack sx={{ gap: 1.5 }}>
          {past.map((s) => (
            <Box key={s.id} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2">{s.label}</Typography>
                  <StatusChip tone={s.status === 'amended' ? 'warning' : 'neutral'}>{s.status === 'amended' ? 'Amended' : 'Closed'}</StatusChip>
                  <Typography variant="caption">{s.content ? `Frozen ${s.content.frozenAt} by ${s.content.frozenBy}` : `Reviewed ${formatDate(s.date)}`}</Typography>
                </Stack>
                <GatedButton allowed={allowed} reason="Only the portfolio lead amends a closed review." size="small" variant="outlined" onClick={() => setAmending(s)}>Amend</GatedButton>
              </Stack>
              {(s.amendments ?? []).length === 0 ? <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>No amendments.</Typography> : (
                <Stack component="ul" sx={{ m: 0, mt: 1, pl: 2.5, gap: 0.5 }}>
                  {(s.amendments ?? []).map((a) => (
                    <Typography key={a.id} component="li" variant="body2">
                      {formatDate(a.date)}, {a.by}: {a.recordId} corrected to &quot;{a.correction}&quot;. Reason: {a.reason}
                    </Typography>
                  ))}
                </Stack>
              )}
            </Box>
          ))}
        </Stack>
      )}
      {amending ? <AmendDialog snapshot={amending} onClose={() => setAmending(null)} /> : null}
    </SectionCard>
  );
}
