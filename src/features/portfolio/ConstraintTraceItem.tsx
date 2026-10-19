import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useEffect, useRef } from 'react';
import { ConditionChip } from '@/shared/components/ConditionChip';
import { ConstraintEvidence } from '@/shared/components/ConstraintEvidence';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import type { TraceRow } from '@/shared/lib/constraints';
import { formatDate } from '@/shared/lib/format';
import { ConstraintImpact } from './ConstraintImpact';
import { commitmentMove } from './ConstraintModel';

/** One dependency on the constraint: what it is, which commitments ride on it, the three kinds of impact, and its evidence. */
export function ConstraintTraceItem({ row, focused = false }: { row: TraceRow; focused?: boolean }) {
  const d = row.dependency;
  const ref = useRef<HTMLDivElement>(null);
  // A linked dependency may sit far down a long trace, so bring it into view once when it arrives focused.
  useEffect(() => { if (focused) ref.current?.scrollIntoView({ block: 'center' }); }, [focused]);
  return (
    <Stack ref={ref} aria-current={focused ? 'true' : undefined}
      sx={(t) => ({
        gap: 1.5, p: 1.5, border: 1, borderRadius: 1, borderColor: focused ? t.palette.brand.accent : t.palette.divider,
        boxShadow: focused ? `0 0 0 3px ${alpha(t.palette.brand.accent, 0.15)}` : 'none',
      })}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" component="p">{d.id}, {d.type}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{d.description}</Typography>
        </Box>
        <ConditionChip condition={d.position} />
      </Stack>
      <Stack direction="row" sx={{ gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <AvatarName name={d.owner} subtitle="Dependency owner" size={24} />
        <Box>
          <Typography variant="overline" component="p">Required by</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatDate(d.requiredDate)}</Typography>
        </Box>
      </Stack>
      <Box>
        <Typography variant="overline" component="p" sx={{ mb: 0.5 }}>Commitments ({row.commitments.length})</Typography>
        {row.commitments.length === 0 ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>None recorded against this dependency.</Typography> : (
          <Stack component="ul" sx={{ m: 0, p: 0, listStyle: 'none', gap: 0.5 }}>
            {row.commitments.map((c) => (
              <Stack key={c.id} component="li" direction={{ xs: 'column', sm: 'row' }} sx={{ gap: { sm: 1.5 }, justifyContent: 'space-between', py: 0.5, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2">{c.title} <Box component="span" sx={{ color: 'text.secondary' }}>({c.owner})</Box></Typography>
                <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  Now {formatDate(c.currentDate)}, baseline {formatDate(c.baselineDate)}, {commitmentMove(c)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
      <ConstraintImpact confirmed={row.confirmedImpact} ownerReported={row.ownerReported} inferred={row.inferredExposure} owner={d.owner} />
      <Box>
        <Typography variant="overline" component="p" sx={{ mb: 0.5 }}>Evidence</Typography>
        <ConstraintEvidence id={d.evidenceId} />
      </Box>
    </Stack>
  );
}
