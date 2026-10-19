import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { FilterChips } from '@/shared/components/ui/Controls';
import type { Programme } from '@/shared/types/domain';
import type { BusinessCapability } from '@/shared/types/workflow';
import type { ReleaseFilterKey, ReleaseFilterValues } from './releaseFilterModel';

type Option = { value: string; label: string };
type Props = {
  values: ReleaseFilterValues;
  onChange: (key: ReleaseFilterKey, value: string) => void;
  programmes: Programme[];
  /** Releases per programme under every other active filter, so each chip shows what choosing it would leave. */
  programmeCounts: Record<string, number>;
  owners: string[];
  capabilities: BusinessCapability[];
};

function Select({ label, value, options, onChange, all = 'All', minWidth = 150 }: { label: string; value: string; options: Option[]; onChange: (v: string) => void; all?: string; minWidth?: number }) {
  return (
    <TextField select size="small" label={label} value={value} onChange={(e) => onChange(e.target.value)} sx={{ minWidth, flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
      <MenuItem value="">{all}</MenuItem>
      {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
    </TextField>
  );
}

/** The reference filter strip: programme and period as pills, the narrower filters as compact selects. All values live in the URL. */
export function ReleaseFilters({ values, onChange, programmes, programmeCounts, owners, capabilities }: Props) {
  const total = Object.values(programmeCounts).reduce((a, b) => a + b, 0);
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Stack sx={{ gap: 1.5 }}>
        <FilterChips label="Programme" value={values.programme} onChange={(v) => onChange('programme', v)}
          options={[{ value: '', label: 'All programmes', count: total }, ...programmes.map((p) => ({ value: p.id, label: p.name, count: programmeCounts[p.id] ?? 0 }))]} />
        <Stack direction="row" sx={{ gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterChips label="Period" value={values.weeks} onChange={(v) => onChange('weeks', v)} options={[{ value: '', label: 'This week' }, { value: 'all', label: 'Include earlier weeks' }]} />
          <FilterChips label="Availability" value={values.availability} onChange={(v) => onChange('availability', v)} options={[{ value: '', label: 'Any' }, { value: 'available', label: 'Available' }, { value: 'not', label: 'Not yet available' }]} />
        </Stack>
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Select label="Business capability" value={values.capability} onChange={(v) => onChange('capability', v)} minWidth={200} options={capabilities.map((c) => ({ value: c.id, label: c.name }))} />
          <Select label="Release owner" value={values.owner} onChange={(v) => onChange('owner', v)} minWidth={180} options={owners.map((o) => ({ value: o, label: o }))} />
          <Select label="Conditions" value={values.unresolved} onChange={(v) => onChange('unresolved', v)} all="Any" minWidth={200} options={[{ value: 'yes', label: 'Has outstanding conditions' }]} />
        </Stack>
      </Stack>
    </Paper>
  );
}
