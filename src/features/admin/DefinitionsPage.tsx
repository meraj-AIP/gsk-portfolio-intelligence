import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDefinitions } from '@/shared/api/hooks';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { formatDate } from '@/shared/lib/format';
import { DefinitionHistory } from './DefinitionHistory';
import { ProposeDefinitionChange } from './ProposeDefinitionChange';

/** S15. Meanings and rules used by the workspace. Changing a definition never makes past delivery look different. */
export function DefinitionsPage() {
  const defs = useDefinitions();
  const [selectedId, setSelectedId] = useUrlParam('def');
  if (defs.isError) return <ErrorState message="Definitions could not be loaded." onRetry={() => void defs.refetch()} />;
  if (!defs.data) return <LoadingState rows={8} />;
  const all = defs.data;
  const areas = [...new Set(all.map((d) => d.area))];
  const sel = all.find((d) => d.id === selectedId) ?? null;

  return (
    <>
      <PageHeader title="Definitions and reporting configuration" subtitle="Portfolio structure, delivery and release definitions, financial and outcome measures, source authority, routing, review rules and briefing templates. Every definition has a version, owner, effective date and reason. Historical briefings keep the definitions in force when they were produced." />
      {all.length === 0 ? <EmptyState title="No definitions recorded" hint="Definitions appear here once the portfolio office adds them." /> : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Stack sx={{ gap: 2 }}>
              {areas.map((area) => (
                <SectionCard key={area} title={area} dense>
                  <Stack sx={{ gap: 0.75 }}>
                    {all.filter((d) => d.area === area).map((d) => (
                      <Box key={d.id} role="button" tabIndex={0} onClick={() => setSelectedId(d.id)} onKeyDown={(e) => { if (e.key === 'Enter') setSelectedId(d.id); }}
                        sx={{ p: 1, border: 1, borderColor: d.id === selectedId ? 'primary.main' : 'divider', borderRadius: 0.5, cursor: 'pointer', bgcolor: d.id === selectedId ? 'background.default' : 'background.paper' }}>
                        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}><Typography variant="subtitle2" sx={{ flex: 1 }}>{d.name}</Typography><Chip label={`v${d.version}`} size="small" variant="outlined" /></Stack>
                        <Typography variant="body2">{d.value}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </SectionCard>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <SectionCard title={sel ? sel.name : 'Selected definition'}>
              {!sel ? <Typography variant="body2" sx={{ color: 'text.secondary' }}>Select a definition to see its history and preview the effect of a change.</Typography> : (
                <Stack sx={{ gap: 2 }}>
                  <KeyValueList items={[{ label: 'Owner', value: sel.owner }, { label: 'Effective from', value: formatDate(sel.effectiveDate) }, { label: 'Version', value: String(sel.version) }, { label: 'Reason for last change', value: sel.reason }]} />
                  <div><Typography variant="caption">Affects</Typography><Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>{sel.affects.map((a) => <Chip key={a} label={a} size="small" />)}</Stack></div>
                  <DefinitionHistory def={sel} />
                  <Typography variant="h3">Propose a change</Typography>
                  <ProposeDefinitionChange key={sel.id} def={sel} />
                </Stack>
              )}
            </SectionCard>
          </Grid>
        </Grid>
      )}
    </>
  );
}
