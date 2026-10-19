import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useProgrammeContribution, useReleases } from '@/shared/api/hooks';
import { EntityLink } from '@/shared/components/EntityLink';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { gbpShort } from '@/shared/lib/format';
import type { ContributionItem } from '@/shared/lib/assessment';

function Column({ title, children, empty }: { title: string; children: ReactNode[]; empty: string }) {
  return (
    <Box sx={(t) => ({ p: 1.5, height: '100%', borderRadius: 1, bgcolor: t.palette.nav.surface })}>
      <Typography variant="overline" component="p" sx={(t) => ({ color: t.palette.nav.muted })}>{title} ({children.length})</Typography>
      <Stack sx={{ gap: 0.5, mt: 0.75 }}>
        {children.length ? children : <Typography variant="body2" sx={(t) => ({ color: t.palette.nav.muted })}>{empty}</Typography>}
      </Stack>
    </Box>
  );
}

/** Dark hero in the reference "enterprise foundation" style. Everything in it is calculated from records, and it says so. */
export function BusinessContribution({ programmeId }: { programmeId: string }) {
  const contribution = useProgrammeContribution(programmeId);
  const releases = useReleases();
  const failed = contribution.isError || releases.isError;
  const c = contribution.data;
  const ratio = c && c.cost.budget ? (c.cost.forecast / c.cost.budget) * 100 : 0;
  const row = (item: ContributionItem) => <Typography key={item.id} variant="body2">{item.text} (<EntityLink id={item.evidenceId} />)</Typography>;

  const body = () => {
    if (failed) return <ErrorState message="The business contribution could not be calculated." onRetry={() => { void contribution.refetch(); void releases.refetch(); }} />;
    if (contribution.isLoading) return <LoadingState rows={3} />;
    if (!c) return <Typography variant="body2">No contribution recorded. The programme has no records to draw a contribution from yet.</Typography>;
    return (
      <Stack sx={{ gap: 2 }}>
        <Typography variant="body1" sx={(t) => ({ color: t.palette.nav.muted, maxWidth: 900 })}>{c.narrative}</Typography>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Column title="Released" empty="Nothing in business use yet.">
              {c.released.map((id) => <Typography key={id} variant="body2"><EntityLink id={id} label={releases.data?.find((r) => r.id === id)?.capability ?? id} /></Typography>)}
            </Column>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}><Column title="Measured" empty="No benefit measured yet.">{c.measured.map(row)}</Column></Grid>
          <Grid size={{ xs: 12, md: 4 }}><Column title="Still forecast" empty="No forecast benefits outstanding.">{c.forecast.map(row)}</Column></Grid>
        </Grid>
        <Box>
          <Stack direction="row" sx={(t) => ({ justifyContent: 'space-between', color: t.palette.nav.muted, fontSize: '0.75rem' })}>
            <span>Forecast spend against budget, direct costs</span>
            <Box component="span" sx={(t) => ({ color: t.palette.common.white, fontWeight: 600, fontVariantNumeric: 'tabular-nums' })}>{gbpShort(c.cost.forecast)} of {gbpShort(c.cost.budget)}</Box>
          </Stack>
          <Box sx={{ mt: 0.75, height: 6, borderRadius: 9999, bgcolor: (t) => alpha(t.palette.common.white, 0.1), overflow: 'hidden' }} role="presentation">
            <Box sx={(t) => ({ height: '100%', width: `${Math.min(100, ratio)}%`, borderRadius: 9999, bgcolor: ratio > 100 ? t.palette.tint.danger.bg : t.palette.brand.accent })} />
          </Box>
        </Box>
      </Stack>
    );
  };

  return (
    <Paper component="section" aria-label="Business contribution" sx={(t) => ({
      p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2, bgcolor: t.palette.brand.navyDark, color: t.palette.common.white, borderColor: t.palette.brand.navy,
      '& .MuiLink-root': { color: t.palette.common.white, textDecorationColor: t.palette.nav.muted },
    })}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="overline" sx={(t) => ({ color: t.palette.brand.accent })}>Business contribution</Typography>
        <Typography variant="label" sx={(t) => ({ color: t.palette.nav.muted })}>Calculated from records</Typography>
      </Stack>
      {body()}
    </Paper>
  );
}
