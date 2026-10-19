import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { StatusChip, type Tone } from '@/shared/components/ui/StatusChip';
import { formatDate } from '@/shared/lib/format';
import type { GovernanceGate } from '@/shared/types/domain';
import { sentence } from './directoryModel';

const TONE: Record<GovernanceGate['status'], Tone> = { passed: 'success', pending: 'warning', 'not started': 'neutral', returned: 'danger' };

/**
 * Governance and compliance vetting as a compact stage-gate row. A solution is not available to the business until
 * the required gates have passed, so the first gate not yet passed carries the orange accent.
 */
export function GovernanceGates({ gates }: { gates: GovernanceGate[] }) {
  if (!gates.length) return <Typography variant="body2" sx={{ color: 'text.secondary' }}>No governance gates recorded.</Typography>;
  const current = gates.findIndex((g) => g.status !== 'passed');
  return (
    <Box component="ol" aria-label="Governance gates" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: `repeat(${Math.min(gates.length, 4)}, 1fr)` } }}>
      {gates.map((g, i) => {
        const active = i === current;
        return (
          <Box component="li" key={g.name} sx={(t) => ({
            p: 1.25, borderRadius: 1, bgcolor: active ? t.palette.tint.accent.bg : t.palette.brand.canvas,
            border: `1px solid ${active ? t.palette.brand.accent : t.palette.divider}`,
          })}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              <Typography variant="overline" sx={(t) => ({ color: active ? t.palette.brand.accent : t.palette.brand.navy })}>{i + 1}. {g.name}</Typography>
              <StatusChip tone={TONE[g.status]} dot={false}>{sentence(g.status)}</StatusChip>
            </Stack>
            <Box sx={(t) => ({ mt: 1, height: 4, borderRadius: 9999, bgcolor: g.status === 'passed' ? t.palette.brand.navy : active ? t.palette.brand.accent : t.palette.divider })} />
            <Typography sx={{ mt: 0.75, fontSize: '0.6875rem', color: 'text.secondary' }}>{g.owner}{g.date ? `, ${formatDate(g.date)}` : ''}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}
