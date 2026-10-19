import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDefinitionPreview } from '@/shared/api/hooks';
import { EntityLink } from '@/shared/components/EntityLink';
import { ErrorState, LoadingState } from '@/shared/components/StatePanels';

/** The recalculated effect of a proposed wording on the open review. Labelled as calculated, never as reported fact. */
export function DefinitionPreviewResult({ id, value }: { id: string; value: string }) {
  const preview = useDefinitionPreview(id, value);
  if (preview.isError) return <ErrorState message={preview.error.message} onRetry={() => void preview.refetch()} />;
  if (!preview.data) return <LoadingState rows={2} />;
  const p = preview.data;
  return (
    <Box sx={{ p: 1.25, border: 1, borderColor: 'info.main', borderRadius: 0.5 }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mb: 0.75 }}>
        <Chip label="Calculated result" size="small" variant="outlined" />
        {p.calculated ? <Typography variant="body2">Before {p.before}, after {p.after}</Typography> : null}
      </Stack>
      <Typography variant="body2">{p.summary}</Typography>
      {p.calculated ? (
        p.changedIds.length === 0 ? <Typography variant="caption">No record changes classification.</Typography> : (
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mt: 0.75 }}>
            <Typography variant="caption">Records that change:</Typography>
            {p.changedIds.map((x) => <Typography key={x} variant="body2"><EntityLink id={x} label={x} /></Typography>)}
          </Stack>
        )
      ) : null}
    </Box>
  );
}
