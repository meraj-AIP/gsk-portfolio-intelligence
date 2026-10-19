import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDefinitions } from '@/shared/api/hooks';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { PageHeader } from '@/shared/components/PageHeader';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import { DomainTag, StatusChip } from '@/shared/components/ui/StatusChip';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { formatDate } from '@/shared/lib/format';
import type { Definition } from '@/shared/types/domain';
import { DefinitionArea } from './DefinitionList';
import { DefinitionHistory } from './DefinitionHistory';
import { ProposeDefinitionChange } from './ProposeDefinitionChange';

const SUBTITLE = 'Every definition has a version, owner, effective date and reason. Historical briefings keep the definitions in force when they were produced.';

function Selected({ def }: { def: Definition }) {
  return (
    <Stack sx={{ gap: 3 }}>
      <SectionCard title={def.name} badge={`Version ${def.version}`} subtitle={def.id}>
        <Stack sx={{ gap: 2 }}>
          <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 500 }}>{def.value}</Typography>
          <KeyValueList items={[{ label: 'Owner', value: def.owner }, { label: 'Effective from', value: formatDate(def.effectiveDate) }, { label: 'Reason for last change', value: def.reason }]} />
          <Box>
            <Typography variant="overline" component="p" sx={{ mb: 0.75 }}>Affects</Typography>
            <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>{def.affects.map((a) => <DomainTag key={a}>{a}</DomainTag>)}</Stack>
          </Box>
        </Stack>
      </SectionCard>
      <SectionCard title="History" subtitle="Every version in force, then the version each closed review was assessed under."><DefinitionHistory def={def} /></SectionCard>
      <SectionCard title="Propose a change" subtitle="Preview the calculated effect on the open review, then apply it with a reason."><ProposeDefinitionChange key={def.id} def={def} /></SectionCard>
    </Stack>
  );
}

/** S15. Meanings and rules used by the workspace. Changing a definition never makes past delivery look different. */
export function DefinitionsPage() {
  const defs = useDefinitions();
  const [selectedId, setSelectedId] = useUrlParam('def');
  const all = defs.data ?? [];
  const areas = [...new Set(all.map((d) => d.area))];
  const sel = all.find((d) => d.id === selectedId) ?? null;
  const eyebrow = defs.data ? (
    <>
      <StatusChip tone="info">{all.length} definitions</StatusChip>
      <Typography variant="overline">{areas.length} areas, each versioned</Typography>
    </>
  ) : undefined;

  return (
    <>
      <PageHeader eyebrow={eyebrow} title="Definitions and reporting configuration" subtitle={SUBTITLE} />
      {defs.isError ? <ErrorState message="Definitions could not be loaded." onRetry={() => void defs.refetch()} />
        : !defs.data ? <LoadingState rows={8} />
          : all.length === 0 ? <EmptyState title="No definitions recorded" hint="Definitions appear here once the portfolio office adds them." /> : (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Stack sx={{ gap: 3 }}>
                  {areas.map((area) => <DefinitionArea key={area} area={area} defs={all.filter((d) => d.area === area)} selectedId={selectedId} onSelect={setSelectedId} />)}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, lg: 7 }}>
                {sel ? <Selected def={sel} /> : (
                  <SectionCard title="Selected definition">
                    <EmptyState title="No definition selected" hint="Select a definition to see its history and preview the effect of a change." />
                  </SectionCard>
                )}
              </Grid>
            </Grid>
          )}
    </>
  );
}
