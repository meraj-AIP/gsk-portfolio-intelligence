import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { SectionCard } from '@/shared/components/SectionCard';
import { ProjectSummaryPanel } from './ProjectSummaryPanel';

/** Side panel beside the directory on wide screens; a full-screen dialog on phones, where a side column would be unreadable. */
export function ProjectSummarySlot({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const small = useMediaQuery(useTheme().breakpoints.down('sm'));
  const open = <Button component={RouterLink} to={`/projects/${projectId}`} variant="contained">Open full record</Button>;
  if (small) {
    return (
      <Dialog open fullScreen onClose={onClose} aria-labelledby="project-summary-title">
        <DialogTitle id="project-summary-title">Project summary</DialogTitle>
        <DialogContent>{open}<ProjectSummaryPanel projectId={projectId} onClose={onClose} /></DialogContent>
      </Dialog>
    );
  }
  return (
    <Grid size={{ xs: 12, lg: 4 }}>
      <SectionCard title="Project summary" actions={open}><ProjectSummaryPanel projectId={projectId} onClose={onClose} /></SectionCard>
    </Grid>
  );
}
