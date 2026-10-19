import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useReview } from '@/app/context/ReviewContext';
import { useDirectory } from '@/shared/api/hooks';
import { DIRECTORY_DEFAULTS } from '@/shared/api/readApi';
import { SectionCard } from '@/shared/components/SectionCard';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import type { Project } from '@/shared/types/domain';
import { downloadCsv } from './OverviewCsv';
import { gateSummary, OverviewMatrixRow } from './OverviewMatrixRow';
import { lifecyclePercent, riskOf } from './OverviewModel';
import { useOverviewParams } from './OverviewParams';
import type { PortfolioView } from './usePortfolioView';

const PAGE_SIZE = 5;
const HEAD = ['Project', 'Programme', 'Owner', 'Stage progress', 'Risk', 'Governance'];

/** Paginated project matrix. Filtering and slicing happen in the directory API; rows show the viewed review's positions. */
export function OverviewMatrixTable({ view }: { view: PortfolioView }) {
  const { scope } = useReview();
  const { q, page, stage, patch } = useOverviewParams();
  const query = useDirectory({
    ...DIRECTORY_DEFAULTS,
    q,
    stage,
    programmeId: scope.portfolio === 'All programmes' ? '' : scope.portfolio,
    page: page - 1,
    pageSize: PAGE_SIZE,
  });
  const programmeName = (id: string) => view.programmes.find((p) => p.id === id)?.name ?? id;
  // The directory serves live records; the overview reads one review, so its positions win where it has them.
  const rows: Project[] = (query.data?.items ?? []).map((p) => view.projects.find((v) => v.id === p.id) ?? p);
  const total = query.data?.total ?? 0;
  const first = total ? (page - 1) * PAGE_SIZE + 1 : 0;

  const exportRows = () => downloadCsv(`portfolio-matrix-page-${page}.csv`, [
    ['Project id', ...HEAD],
    ...rows.map((p) => [p.id, p.name, programmeName(p.programmeId), p.owner, `${p.stage} (${lifecyclePercent(p)}%)`, riskOf(p).label, gateSummary(p)]),
  ]);

  const tools = (
    <Stack direction="row" sx={{ gap: 1 }}>
      <TextField
        placeholder="Filter rows"
        value={q}
        onChange={(e) => patch({ mq: e.target.value, mpage: null })}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><FilterListIcon fontSize="small" /></InputAdornment> }, htmlInput: { 'aria-label': 'Filter matrix rows' } }}
      />
      <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportRows} disabled={!rows.length}>CSV</Button>
    </Stack>
  );

  const body = () => {
    if (query.isError) return <ErrorState message="The project list could not be loaded." onRetry={() => void query.refetch()} />;
    if (!query.data) return <LoadingState rows={PAGE_SIZE} />;
    if (!rows.length) return <EmptyState title="No projects match" hint="Clear the row filter, the stage or the programme filter." />;
    return (
      <>
        <Box sx={{ overflowX: 'auto', mx: { xs: -2, md: -2.5 } }}>
          <Table sx={{ minWidth: 880 }}>
            <TableHead><TableRow>{HEAD.map((h) => <TableCell key={h}>{h}</TableCell>)}<TableCell align="right">Actions</TableCell></TableRow></TableHead>
            <TableBody>{rows.map((p) => <OverviewMatrixRow key={p.id} project={p} programme={programmeName(p.programmeId)} />)}</TableBody>
          </Table>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1.5, pt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Showing {first} to {first + rows.length - 1} of {total}</Typography>
          <Pagination count={Math.max(1, Math.ceil(total / PAGE_SIZE))} page={page} onChange={(_, p) => patch({ mpage: p === 1 ? null : p })} shape="rounded" size="small" />
        </Stack>
      </>
    );
  };

  return (
    <SectionCard
      title="Active portfolio matrix"
      subtitle={`Stage, risk and governance position for every project in scope${stage ? `, ${stage.toLowerCase()} stage only` : ''}.`}
      actions={tools}
    >
      {body()}
    </SectionCard>
  );
}
