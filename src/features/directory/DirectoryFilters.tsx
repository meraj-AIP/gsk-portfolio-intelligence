import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { DirectoryParams } from '@/shared/api/readApi';
import { FilterChips } from '@/shared/components/ui/Controls';
import { STAGES, type Programme, type Project } from '@/shared/types/domain';
import { countBy } from './directoryModel';

const AREAS = ['R&D', 'Commercial', 'Medical Affairs', 'Global Supply Chain', 'Quality', 'Enterprise Data and AI'];
const SORTS: { value: DirectoryParams['sort']; label: string }[] = [
  { value: 'name', label: 'Project name' }, { value: 'owner', label: 'Owner' }, { value: 'commitment', label: 'Commitment date' }, { value: 'reportingDate', label: 'Most recently reported' },
];

type Props = { params: DirectoryParams; onParams: (p: Partial<DirectoryParams>) => void; programmes: Programme[]; projects: Project[]; scopedTo?: string | undefined };

/** Programme and stage pills with counts from the project records in scope, then the search and remaining filters. */
export function DirectoryFilters({ params, onParams, programmes, projects, scopedTo }: Props) {
  const [draft, setDraft] = useState(params.q);
  const byProgramme = countBy(projects, (p) => p.programmeId);
  const byStage = countBy(projects, (p) => p.stage);
  const active = Boolean(params.q || params.programmeId || params.stage || params.businessArea);
  return (
    <Stack sx={{ gap: 1.5 }}>
      {scopedTo
        ? <Typography variant="label" sx={{ color: 'text.secondary' }}>Programme set by the portfolio scope: {programmes.find((p) => p.id === scopedTo)?.name ?? scopedTo}</Typography>
        : <FilterChips label="Programme" value={params.programmeId} onChange={(v) => onParams({ programmeId: v })}
            options={[{ value: '', label: 'All programmes', count: projects.length }, ...programmes.map((p) => ({ value: p.id, label: p.name, count: byProgramme.get(p.id) ?? 0 }))]} />}
      <FilterChips label="Stage" value={params.stage} onChange={(v) => onParams({ stage: v })}
        options={[{ value: '', label: 'All stages', count: projects.length }, ...STAGES.filter((s) => byStage.has(s)).map((s) => ({ value: s, label: s, count: byStage.get(s) ?? 0 }))]} />
      <Stack direction="row" sx={(t) => ({ gap: 1, flexWrap: 'wrap', alignItems: 'center', p: 1, borderRadius: 1, bgcolor: t.palette.brand.canvas, border: `1px solid ${t.palette.divider}` })}>
        <TextField
          placeholder="Search name, objective, owner, capability, dependency or release" value={draft}
          onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onParams({ q: draft }); }} onBlur={() => { if (draft !== params.q) onParams({ q: draft }); }}
          slotProps={{ htmlInput: { 'aria-label': 'Search the directory' }, input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          sx={{ flex: '1 1 320px' }}
        />
        <TextField select label="Business area" value={params.businessArea} onChange={(e) => onParams({ businessArea: e.target.value })} sx={{ minWidth: 200 }}>
          <MenuItem value="">All</MenuItem>{AREAS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
        </TextField>
        <TextField select label="Sort by" value={params.sort} onChange={(e) => onParams({ sort: e.target.value as DirectoryParams['sort'] })} sx={{ minWidth: 200 }}>
          {SORTS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
        </TextField>
        {active ? <Button onClick={() => { setDraft(''); onParams({ q: '', programmeId: '', stage: '', businessArea: '' }); }} sx={{ color: 'secondary.main' }}>Clear filters</Button> : null}
      </Stack>
    </Stack>
  );
}
