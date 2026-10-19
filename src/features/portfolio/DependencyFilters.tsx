import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useUrlParam } from '@/shared/hooks/useUrlState';
import { DEPENDENCY_TYPES, type Project } from '@/shared/types/domain';

export type DependencyFilterValues = { project: string; owner: string; type: string; before: string };

/** Filters live in the URL so a filtered view can be shared; any change sends the list back to its first page. */
export function useDependencyFilters() {
  const [project, setProject] = useUrlParam('project');
  const [owner, setOwner] = useUrlParam('owner');
  const [type, setType] = useUrlParam('type');
  const [before, setBefore] = useUrlParam('before');
  const [, setPage] = useUrlParam('page');
  const wrap = (fn: (v: string | null) => void) => (v: string) => { fn(v); setPage(null); };
  return { values: { project, owner, type, before }, set: { project: wrap(setProject), owner: wrap(setOwner), type: wrap(setType), before: wrap(setBefore) } };
}

type Props = { filters: ReturnType<typeof useDependencyFilters>; projects: Project[]; owners: string[]; listView: boolean; summary: string };

export function DependencyFilters({ filters: { values, set }, projects, owners, listView, summary }: Props) {
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="overline" sx={{ mr: 0.5 }}>Filter relationships</Typography>
        <TextField select label="Project" value={values.project} onChange={(e) => set.project(e.target.value)} size="small" sx={{ minWidth: 220 }}><MenuItem value="">All in scope</MenuItem>{projects.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}</TextField>
        <TextField select label="Owner" value={values.owner} onChange={(e) => set.owner(e.target.value)} size="small" sx={{ minWidth: 200 }}><MenuItem value="">All</MenuItem>{owners.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}</TextField>
        <TextField select label="Relationship" value={values.type} onChange={(e) => set.type(e.target.value)} size="small" sx={{ minWidth: 220 }}><MenuItem value="">All</MenuItem>{DEPENDENCY_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField>
        <TextField size="small" label="Required before" type="date" value={values.before} onChange={(e) => set.before(e.target.value)} slotProps={{ inputLabel: { shrink: true } }}
          disabled={listView} helperText={listView ? 'Applies to the graph view' : undefined} />
        {listView ? null : <Typography variant="label" sx={{ ml: 'auto', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{summary}</Typography>}
      </Stack>
    </Paper>
  );
}
