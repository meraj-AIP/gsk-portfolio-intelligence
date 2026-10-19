import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { StatementFrame } from '@/shared/components/ui/Statement';
import { useDefinitionPreview } from '@/shared/api/hooks';
import { EntityLink } from '@/shared/components/EntityLink';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <Box>
      <Typography variant="overline" component="p">{label}</Typography>
      <Typography variant="h2" component="p" sx={{ fontWeight: 700, fontFeatureSettings: '"tnum"' }}>{value}</Typography>
    </Box>
  );
}

/** The recalculated effect of a proposed wording on the open review. Labelled as calculated, never as reported fact. */
export function DefinitionPreviewResult({ id, value }: { id: string; value: string }) {
  const preview = useDefinitionPreview(id, value);
  if (preview.isError) return <ErrorState message={preview.error.message} onRetry={() => void preview.refetch()} />;
  if (!preview.data) return <LoadingState rows={2} />;
  const p = preview.data;
  return (
    <StatementFrame type="calculated result" label="Calculated result, effect on the open review">
      <Stack sx={{ gap: 1.25 }}>
        {p.calculated ? <Stack direction="row" sx={{ gap: 4 }}><Figure label="Before" value={p.before} /><Figure label="After" value={p.after} /></Stack> : null}
        <Typography variant="body2">{p.summary}</Typography>
        {p.calculated ? (
          p.changedIds.length === 0 ? <Typography variant="caption">No record changes classification.</Typography> : (
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'baseline' }}>
              <Typography variant="overline">Records that change</Typography>
              {p.changedIds.map((x) => <Typography key={x} variant="body2"><EntityLink id={x} label={x} /></Typography>)}
            </Stack>
          )
        ) : null}
      </Stack>
    </StatementFrame>
  );
}
