import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import type { ReactNode } from 'react';

/** On phones the selected relationship opens full screen, because the side column would sit far below the graph. */
export function DependencyDialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Dialog fullScreen open={open} onClose={onClose} aria-labelledby="dependency-detail-title">
      <DialogTitle id="dependency-detail-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Selected relationship
        <IconButton aria-label="Close" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
