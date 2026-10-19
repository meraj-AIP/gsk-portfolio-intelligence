import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { DomainTag, StatusChip } from '@/shared/components/ui/StatusChip';
import type { ReleaseSummary } from '@/shared/lib/constraints';
import { releaseStatus, slipText } from './releaseStatus';
import { shortDate } from './weekModel';

type Props = { summary: ReleaseSummary; projectName: string; programmeName: string; selected: boolean; onSelect: () => void };

function Fact({ label, value, note }: { label: string; value: ReactNode; note?: string | undefined }) {
  return (
    <Box sx={(t) => ({ bgcolor: t.palette.brand.canvas, px: 1, py: 0.75, borderRadius: 0.5, minWidth: 0 })}>
      <Typography variant="overline" component="p" sx={{ fontSize: '0.625rem' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      {note ? <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>{note}</Typography> : null}
    </Box>
  );
}

/**
 * One release as a reference initiative tile: programme tag and availability chip, the capability, a fact grid with
 * planned against actual, audience and adoption, then whatever is still open. The whole card opens the release panel.
 */
export function ReleaseCard({ summary: s, projectName, programmeName, selected, onSelect }: Props) {
  const r = s.release;
  const status = releaseStatus(s);
  const moved = Boolean(s.plannedLatest && s.plannedFirst && s.plannedLatest !== s.plannedFirst);
  const open = s.conditions.length > 0;
  return (
    <Card sx={(t) => ({ height: '100%', ...(selected ? { borderColor: t.palette.brand.accent, boxShadow: `0 0 0 3px ${alpha(t.palette.brand.accent, 0.15)}` } : {}) })}>
      <ButtonBase onClick={onSelect} aria-pressed={selected} aria-label={`${r.capability}, ${status.text}`}
        sx={(t) => ({ display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', gap: 1.5, p: 2, width: '100%', height: '100%', '&:focus-visible': { outline: `2px solid ${t.palette.brand.accent}`, outlineOffset: -2 } })}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <DomainTag>{programmeName}</DomainTag>
          <StatusChip tone={status.tone}>{status.text}</StatusChip>
        </Stack>
        <Box>
          <Typography variant="h3" component="span" sx={{ display: 'block', color: 'primary.main' }}>{r.capability}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{projectName}. {r.businessCapability}</Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
          <Fact label="First planned" value={s.plannedFirst ? shortDate(s.plannedFirst) : 'Not recorded'} note={moved && s.plannedLatest ? `Moved to ${shortDate(s.plannedLatest)}` : undefined} />
          <Fact label="Available" value={s.availableOn ? shortDate(s.availableOn) : 'Not yet'} note={s.slipDays !== undefined ? slipText(s.slipDays) : undefined} />
          <Fact label="Audience" value={r.enabledTeams.length ? `${r.enabledTeams.length} team${r.enabledTeams.length === 1 ? '' : 's'}` : 'None enabled'} note={r.enabledTeams.length ? s.audience : undefined} />
          <Fact label="Adoption" value={r.adoption ? `${r.adoption.activeUsers} active users` : 'None observed'} note={r.adoption ? `${r.adoption.period}${r.adoption.early ? ', early evidence' : ''}` : undefined} />
        </Box>
        <Box sx={(t) => ({ bgcolor: t.palette.brand.canvas, px: 1, py: 0.75, borderRadius: 0.5 })}>
          <Typography variant="overline" component="p" sx={(t) => ({ fontSize: '0.625rem', color: open ? t.palette.brand.accent : undefined })}>
            Remaining conditions{open ? ` (${s.conditions.length})` : ''}
          </Typography>
          {open
            ? s.conditions.map((c) => <Typography key={c} variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{c}</Typography>)
            : <Typography variant="body2" sx={{ color: 'text.secondary' }}>None outstanding</Typography>}
        </Box>
        <Box sx={{ mt: 'auto', pt: 0.5 }}>
          <AvatarName name={r.owner} subtitle="Release owner" />
        </Box>
      </ButtonBase>
    </Card>
  );
}
