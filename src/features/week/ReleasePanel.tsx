import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBriefingTray } from '@/app/context/BriefingTrayContext';
import { ConstraintEvidence } from '@/shared/components/ConstraintEvidence';
import { EntityLink } from '@/shared/components/EntityLink';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { DomainTag, StatusChip } from '@/shared/components/ui/StatusChip';
import { releaseSummary } from '@/shared/lib/constraints';
import { formatDate } from '@/shared/lib/format';
import type { Release } from '@/shared/types/domain';
import { AdoptionView } from './AdoptionView';
import { ReleaseComparison } from './ReleaseComparison';
import { ReleaseConditions } from './ReleaseConditions';
import { releaseStatus } from './releaseStatus';
import { EVENT_LABEL } from './ReleaseTable';

type Props = { release: Release | null; previous: Release | undefined; projectName: string; programmeName: string; readOnly: boolean; onClose: () => void };

function Events({ release: r }: { release: Release }) {
  if (!r.events.length) return <Typography variant="body2" sx={{ color: 'text.secondary' }}>None recorded.</Typography>;
  return (
    <Stack sx={{ gap: 0.5 }}>
      {r.events.map((e, i) => (
        <Stack key={i} direction="row" sx={(t) => ({ gap: 1.5, px: 1, py: 0.75, borderRadius: 0.5, bgcolor: t.palette.brand.canvas, alignItems: 'baseline' })}>
          <Typography variant="label" sx={{ minWidth: 84, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>{formatDate(e.date)}</Typography>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{EVENT_LABEL[e.kind]}</Typography>
            {e.note ? <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>{e.note}</Typography> : null}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

/**
 * Release detail as a side panel opened by ?release=. Focus is not trapped so the evidence and finding panels it links to
 * stay usable while it is open.
 */
export function ReleasePanel({ release: r, previous, projectName, programmeName, readOnly, onClose }: Props) {
  const [tab, setTab] = useState(0);
  const tray = useBriefingTray();
  const [, setParams] = useSearchParams();
  const ask = (id: string) => setParams((prev) => { const next = new URLSearchParams(prev); next.set('ask', id); next.set('q', 'Why did the release date move?'); return next; }, { replace: true });
  const status = r ? releaseStatus(releaseSummary(r)) : null;
  return (
    <Drawer anchor="right" open={Boolean(r)} onClose={onClose} disableEnforceFocus slotProps={{ paper: { sx: { width: { xs: '100%', sm: 620 }, p: 3, bgcolor: 'background.paper' } } }}>
      {r && status ? (
        <Stack sx={{ gap: 2 }} aria-label={`Release ${r.capability}`}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <DomainTag>{programmeName}</DomainTag>
              <StatusChip tone={status.tone}>{status.text}</StatusChip>
            </Stack>
            <IconButton aria-label="Close release detail" onClick={onClose} sx={{ border: 1, borderColor: 'divider' }} size="small"><CloseIcon fontSize="small" /></IconButton>
          </Stack>
          <Box>
            <Typography variant="h2" component="h2">{r.capability}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{r.businessCapability}. Project <EntityLink id={r.projectId} label={projectName} />.</Typography>
          </Box>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <AvatarName name={r.owner} subtitle="Release owner" />
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
              <Button variant="outlined" onClick={() => ask(r.projectId)}>Ask about this release</Button>
              <Button variant="outlined" disabled={tray.has(r.id)} onClick={() => tray.add(r.id)}>{tray.has(r.id) ? 'In briefing' : 'Add summary to briefing'}</Button>
            </Stack>
          </Stack>
          <Tabs value={tab} variant="scrollable" allowScrollButtonsMobile onChange={(_, v: number) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Availability and adoption" /><Tab label="Compare with previous" /><Tab label="Conditions and evidence" />
          </Tabs>
          {tab === 0 ? (
            <Stack sx={{ gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Business acceptance and release conditions reflect the release owner&apos;s records; this workspace does not authorise release.</Typography>
              <Box>
                <Typography variant="overline" component="p" sx={{ mb: 0.75 }}>Availability events, as recorded</Typography>
                <Events release={r} />
              </Box>
              <AdoptionView release={r} />
            </Stack>
          ) : null}
          {tab === 1 ? <ReleaseComparison release={r} previous={previous} isLoading={false} isError={false} /> : null}
          {tab === 2 ? (
            <Stack sx={{ gap: 2 }}>
              <Box>
                <Typography variant="overline" component="p" sx={{ mb: 0.75 }}>Availability evidence</Typography>
                <ConstraintEvidence id={r.evidenceId} />
              </Box>
              <ReleaseConditions release={r} readOnly={readOnly} />
            </Stack>
          ) : null}
        </Stack>
      ) : null}
    </Drawer>
  );
}
