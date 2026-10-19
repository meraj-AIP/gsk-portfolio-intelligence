import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState } from 'react';
import { EntityLink } from '@/shared/components/EntityLink';
import { KeyValueList } from '@/shared/components/KeyValueList';
import type { AuditEntry } from '@/shared/types/workflow';

const COLUMNS = 8;

export function AuditRow({ entry }: { entry: AuditEntry }) {
  const [open, setOpen] = useState(false);
  const inputs = Object.entries(entry.inputs);
  return (
    <>
      <TableRow hover>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{entry.at}</TableCell>
        <TableCell>{entry.user}</TableCell>
        <TableCell>{entry.role}</TableCell>
        <TableCell>{entry.kind}</TableCell>
        <TableCell><EntityLink id={entry.targetId} /></TableCell>
        <TableCell>{entry.summary}</TableCell>
        <TableCell>{entry.evidenceVersion !== undefined ? `v${entry.evidenceVersion}` : 'Not applicable'}</TableCell>
        <TableCell>
          {inputs.length ? (
            <IconButton size="small" aria-label={open ? 'Hide inputs' : 'Show inputs'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
              {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
            </IconButton>
          ) : 'None'}
        </TableCell>
      </TableRow>
      {inputs.length ? (
        <TableRow>
          <TableCell colSpan={COLUMNS} sx={{ py: 0, borderBottom: open ? undefined : 0 }}>
            <Collapse in={open} unmountOnExit>
              <KeyValueList columns={3} items={inputs.map(([label, value]) => ({ label, value: value || 'Empty' }))} />
            </Collapse>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
