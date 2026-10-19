import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { OutcomeMeasure } from '@/shared/types/domain';
import { EntityLink } from '@/shared/components/EntityLink';

const GROUPS: { kind: OutcomeMeasure['kind']; title: string }[] = [
  { kind: 'forecast benefit', title: 'Forecast benefits' },
  { kind: 'measured outcome', title: 'Measured outcomes' },
  { kind: 'released capacity', title: 'Released capacity' },
  { kind: 'cash saving', title: 'Cash savings' },
];

const num = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } as const;

/** Each kind gets its own table with no total row: forecasts, measurements, capacity and cash are not additive. */
export function OutcomeGroups({ measures }: { measures: OutcomeMeasure[] }) {
  if (!measures.length) return <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>No outcome measure defined. This gap stays visible in the programme assessment.</Typography>;
  return (
    <Stack sx={{ gap: 2, mt: 1 }}>
      {GROUPS.map((g) => {
        const rows = measures.filter((m) => m.kind === g.kind);
        if (!rows.length) return null;
        return (
          <Box key={g.kind} sx={{ overflowX: 'auto' }}>
            <Typography variant="label" sx={{ display: 'block', mb: 0.75, color: 'primary.main' }}>{g.title} ({rows.length})</Typography>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead><TableRow><TableCell>Measure</TableCell><TableCell align="right">Baseline</TableCell><TableCell align="right">Forecast</TableCell><TableCell align="right">Measured</TableCell><TableCell>Population and attribution</TableCell><TableCell>Owner, period</TableCell><TableCell /></TableRow></TableHead>
              <TableBody>
                {rows.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{o.name}</Typography><Typography variant="caption">{o.definition}</Typography></TableCell>
                    <TableCell align="right" sx={num}>{o.baseline}</TableCell>
                    <TableCell align="right" sx={num}>{o.forecast}</TableCell>
                    <TableCell align="right" sx={{ ...num, fontWeight: o.actual ? 700 : 400, color: o.actual ? 'primary.main' : 'text.secondary' }}>{o.actual ?? 'Not yet'}</TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Typography variant="caption" sx={{ display: 'block' }}>Population: {o.population ?? 'Not stated'}</Typography>
                      <Typography variant="caption">Attribution: {o.attribution ?? 'Not stated'}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="caption">{o.owner}, {o.period}</Typography></TableCell>
                    <TableCell><EntityLink id={o.evidenceId} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        );
      })}
    </Stack>
  );
}
