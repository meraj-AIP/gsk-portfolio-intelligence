import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { formatDate } from '@/shared/lib/format';
import type { Evidence } from '@/shared/types/domain';

type Version = { version: number; date?: string; fields: Record<string, string> };

/** Older records only carry previousFields; treat that as the version before the current one. */
function earlierVersions(e: Evidence): Version[] {
  const history = (e.history ?? []).filter((h) => h.version !== e.version);
  if (history.length) return [...history].sort((a, b) => b.version - a.version);
  return e.previousFields ? [{ version: e.version - 1, fields: e.previousFields }] : [];
}

/** Field values for the current version, compared field by field with any earlier version the user picks. */
export function EvidenceFields({ e }: { e: Evidence }) {
  const versions = earlierVersions(e);
  const [selected, setSelected] = useState<number | ''>('');
  const other = versions.find((v) => v.version === selected);
  const keys = [...new Set([...Object.keys(e.fields), ...Object.keys(other?.fields ?? {})])];
  return (
    <Stack sx={{ gap: 1 }}>
      {versions.length ? (
        <TextField select size="small" label="Compare with version" value={selected} onChange={(ev) => setSelected(ev.target.value === '' ? '' : Number(ev.target.value))} sx={{ maxWidth: 280 }}>
          <MenuItem value="">No comparison</MenuItem>
          {versions.map((v) => <MenuItem key={v.version} value={v.version}>Version {v.version}{v.date ? `, ${formatDate(v.date)}` : ''}</MenuItem>)}
        </TextField>
      ) : null}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Field</TableCell>
            <TableCell>Value (v{e.version})</TableCell>
            {other ? <TableCell>Version {other.version}</TableCell> : null}
            {other ? <TableCell>Change</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {keys.map((k) => {
            const now = e.fields[k];
            const then = other?.fields[k];
            const change = now === undefined ? 'Removed' : then === undefined ? 'Added' : now === then ? 'Same' : 'Changed';
            return (
              <TableRow key={k}>
                <TableCell>{k}</TableCell>
                <TableCell sx={{ fontWeight: other && change !== 'Same' ? 700 : 400 }}>{now ?? 'Not present'}</TableCell>
                {other ? <TableCell sx={{ color: 'text.secondary' }}>{then ?? 'Not present'}</TableCell> : null}
                {other ? <TableCell>{change}</TableCell> : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Stack>
  );
}
