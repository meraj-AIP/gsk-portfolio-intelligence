import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useReview } from '@/app/context/ReviewContext';
import { useAllProjects, useDependencies, useFindings, useProgrammes, useSnapshotContent } from '@/shared/api/hooks';
import type { DependencyType } from '@/shared/types/domain';
import { onTrack } from './OverviewModel';

const FOUNDATION = 'Digital Worker Foundations';
const SUPPORT: DependencyType[] = ['delivers a capability', 'shares a service'];

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
      <Typography variant="body2" sx={(t) => ({ color: t.palette.nav.muted })}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
    </Stack>
  );
}

/**
 * The reference's dark "enterprise foundation" tile, filled with the foundations programme's real figures.
 * Hidden while loading or when the programme is absent, because it is context rather than a primary figure.
 */
export function OverviewFoundationCard() {
  const { scope } = useReview();
  const programme = useProgrammes().data?.find((p) => p.name === FOUNDATION);
  const projects = useAllProjects().data;
  const deps = useDependencies().data;
  const findings = useFindings().data;
  const snap = useSnapshotContent(scope.viewSnapshotId).data?.content;
  if (!programme || !projects || !deps || !findings) return null;

  // Positions come from the viewed review so this tile agrees with the cards beside it.
  const own = projects.filter((p) => p.programmeId === programme.id).map((p) => ({ ...p, position: snap?.positions[p.id] ?? p.position }));
  const ownIds = new Set(own.map((p) => p.id));
  const supported = new Set(deps.filter((d) => SUPPORT.includes(d.type)).flatMap((d) => {
    if (ownIds.has(d.fromId) && !ownIds.has(d.toId)) return [d.toId];
    if (ownIds.has(d.toId) && !ownIds.has(d.fromId)) return [d.fromId];
    return [];
  }).filter((id) => projects.some((p) => p.id === id)));
  const governance = findings.find((f) => f.category === 'governance' && f.affectedIds.some((id) => ownIds.has(id)));
  const backlog = governance?.currentPosition.match(/\d+/)?.[0];
  const fine = own.filter(onTrack).length;
  const share = own.length ? Math.round((fine / own.length) * 100) : 0;

  return (
    <Card sx={(t) => ({ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: t.palette.brand.navyDark, color: t.palette.common.white, borderColor: t.palette.brand.navy })}>
      <Typography variant="overline" sx={(t) => ({ color: t.palette.brand.accent })}>Enterprise foundation</Typography>
      <Box>
        <Typography variant="h2" component="h3" sx={{ color: 'inherit', fontSize: '1.1875rem' }}>{programme.name}</Typography>
        <Typography variant="body2" sx={(t) => ({ color: t.palette.nav.muted, mt: 0.75 })}>{programme.objective}</Typography>
      </Box>
      <Stack sx={{ gap: 0.75 }}>
        <Figure label="Projects it supports" value={String(supported.size)} />
        {backlog ? <Figure label="Vetting backlog (calculated)" value={`${backlog} solutions`} /> : null}
      </Stack>
      <Box>
        <Figure label="Foundation projects on track" value={`${fine} of ${own.length}`} />
        <Box sx={(t) => ({ mt: 0.75, height: 4, borderRadius: 9999, bgcolor: t.palette.brand.navy, overflow: 'hidden' })}>
          <Box sx={(t) => ({ height: '100%', width: `${share}%`, bgcolor: t.palette.brand.accent, borderRadius: 9999 })} />
        </Box>
      </Box>
      <Stack direction="row" sx={{ mt: 'auto', pt: 1, justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography sx={(t) => ({ fontFamily: 'monospace', fontSize: '0.75rem', color: t.palette.nav.muted })}>Lead: {programme.lead}</Typography>
        <Button variant="contained" color="secondary" size="small" component={RouterLink} to={`/programmes/${programme.id}`}>Open programme</Button>
      </Stack>
    </Card>
  );
}
