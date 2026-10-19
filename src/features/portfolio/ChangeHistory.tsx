import Box from '@mui/material/Box';
import { SectionCard } from '@/shared/components/SectionCard';
import { AmendmentList } from './ReviewRecords';
import type { PortfolioView } from './usePortfolioView';

/**
 * Corrections recorded against an amended review. Movement between reviews now lives in "Since last review",
 * so this only appears when the viewed review has been amended.
 */
export function ChangeHistory({ view }: { view: PortfolioView }) {
  if (!view.amendments.length) return null;
  return (
    <SectionCard title="Review record">
      <Box sx={{ overflowX: 'auto' }}><AmendmentList amendments={view.amendments} /></Box>
    </SectionCard>
  );
}
