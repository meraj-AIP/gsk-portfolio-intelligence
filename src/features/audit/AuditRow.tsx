import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState } from 'react';
import { EntityLink } from '@/shared/components/EntityLink';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { AvatarName } from '@/shared/components/ui/AvatarName';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import type { AuditEntry } from '@/shared/types/workflow';

const COLUMNS = 7;

export function AuditRow({ entry }: { entry: AuditEntry }) {
  const [open, setOpen] = useState(false);
  const inputs = Object.entries(entry.inputs);
  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap', fontFeatureSettings: '"tnum"' }}>{entry.at}</TableCell>
        <TableCell><AvatarName name={entry.user} subtitle={entry.role} size={24} /></TableCell>
        <TableCell><StatusChip tone="neutral" square dot={false}>{entry.kind}</StatusChip></TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}><EntityLink id={entry.targetId} /></TableCell>
        <TableCell sx={{ maxWidth: 360 }}>{entry.summary}</TableCell>
        <TableCell>{entry.evidenceVersion !== undefined ? `v${entry.evidenceVersion}` : <Typography variant="caption">Not applicable</Typography>}</TableCell>
        <TableCell align="right">
          {inputs.length ? (
            <IconButton size="small" aria-label={open ? 'Hide inputs' : 'Show inputs'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
              {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
            </IconButton>
          ) : <Typography variant="caption">None</Typography>}
        </TableCell>
      </TableRow>
      {inputs.length ? (
        <TableRow>
          <TableCell colSpan={COLUMNS} sx={(t) => ({ py: 0, bgcolor: t.palette.brand.canvas, borderBottom: open ? undefined : 0 })}>
            <Collapse in={open} unmountOnExit>
              <Typography variant="overline" component="p" sx={{ pt: 1.5 }}>Inputs supplied</Typography>
              <KeyValueList columns={3} items={inputs.map(([label, value]) => ({ label, value: value || 'Empty' }))} />
            </Collapse>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
