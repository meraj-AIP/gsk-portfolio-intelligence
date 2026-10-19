import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { GovernanceGate } from '@/shared/types/domain';
import { formatDate } from '@/shared/lib/format';

const COLOUR: Record<GovernanceGate['status'], 'success' | 'warning' | 'default' | 'error'> = { passed: 'success', pending: 'warning', 'not started': 'default', returned: 'error' };

/** Governance and compliance vetting status: a solution is not available to the business until the required gates have passed. */
export function GovernanceGates({ gates }: { gates: GovernanceGate[] }) {
  return (
    <div>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Governance and compliance vetting</Typography>
      <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
        {gates.map((g) => <Chip key={g.name} color={COLOUR[g.status]} variant={g.status === 'passed' ? 'filled' : 'outlined'} label={`${g.name}: ${g.status}${g.date ? `, ${formatDate(g.date)}` : ''} (${g.owner})`} />)}
      </Stack>
    </div>
  );
}
