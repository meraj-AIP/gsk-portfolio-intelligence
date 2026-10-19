import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useId, type ReactNode } from 'react';
import { SectionCard } from '@/shared/components/SectionCard';

type Props = { title: string; open: boolean; onClose: () => void; placeholder: string; children: ReactNode };

/** A side panel on wide screens; on phones the selection opens full screen so the detail is readable. */
export function ResponsivePanel({ title, open, onClose, placeholder, children }: Props) {
  const small = useMediaQuery(useTheme().breakpoints.down('sm'));
  const titleId = useId();
  if (small) {
    return (
      <Dialog fullScreen open={open} onClose={onClose} aria-labelledby={titleId}>
        <DialogTitle id={titleId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          {title}
          <IconButton aria-label="Close" onClick={onClose} edge="end"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>{children}</DialogContent>
      </Dialog>
    );
  }
  return (
    <SectionCard title={title}>
      {open ? children : <Typography variant="body2" sx={{ color: 'text.secondary' }}>{placeholder}</Typography>}
    </SectionCard>
  );
}
