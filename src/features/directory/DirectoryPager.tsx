import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Page } from '@/shared/types/domain';

type Props = { page: Page<unknown>; onPage: (n: number) => void; onSize: (n: number) => void };

/** Reference pager: "Showing X to Y of N" on the left, page buttons and page size on the right. Pages are zero-based in the URL. */
export function DirectoryPager({ page, onPage, onSize }: Props) {
  const from = page.total ? page.page * page.pageSize + 1 : 0;
  const to = Math.min(page.total, (page.page + 1) * page.pageSize);
  const count = Math.max(1, Math.ceil(page.total / page.pageSize));
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5, px: 2, py: 1.5 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
        Showing <strong>{from}</strong> to <strong>{to}</strong> of <strong>{page.total}</strong> projects
      </Typography>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <TextField select value={page.pageSize} onChange={(e) => onSize(Number(e.target.value))} slotProps={{ htmlInput: { 'aria-label': 'Projects per page' } }} sx={{ width: 96 }}>
          {[6, 12, 24].map((n) => <MenuItem key={n} value={n}>{n} / page</MenuItem>)}
        </TextField>
        <Pagination count={count} page={page.page + 1} onChange={(_, n) => onPage(n - 1)} shape="rounded" size="small" color="primary" />
      </Stack>
    </Stack>
  );
}
