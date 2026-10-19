import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { usePortfolioAssessment } from '@/shared/api/hooks';

type Props = { scope: string; snapshotId: string; narrative: string; onInsert: (narrative: string) => void };

/** One click puts the four calculated assessment lines at the start of the narrative; the preparer then edits freely. */
export function InsertAssessment({ scope, snapshotId, narrative, onInsert }: Props) {
  const lines = usePortfolioAssessment(scope, snapshotId);
  const text = (lines.data ?? []).map((l) => `${l.heading}: ${l.text}`).join('\n\n');
  const already = Boolean(text) && narrative.includes(text);
  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
      <Button size="small" variant="outlined" disabled={!lines.data?.length || already}
        onClick={() => onInsert(narrative.trim() ? `${text}\n\n${narrative}` : text)}>
        Insert portfolio assessment
      </Button>
      <Typography variant="caption">
        {lines.isError ? 'The assessment could not be calculated.' : lines.isLoading ? 'Calculating the assessment.' : already ? 'Assessment lines are in the narrative.' : 'Four lines calculated from records for this snapshot. Once inserted they are editable text.'}
      </Typography>
    </Stack>
  );
}
