import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { Page } from '@/shared/types/domain';

type Props<T> = { data: Page<T>; noun: string; onPage: (n: number) => void; sizes?: number[]; onSize?: (n: number) => void };

/** Zero-based page indexes to show; long runs collapse to the first, the last and the neighbours of the current page. */
function pageList(current: number, count: number): (number | 'gap')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i);
  const near = [current - 1, current, current + 1].filter((p) => p > 0 && p < count - 1);
  const out: (number | 'gap')[] = [0];
  if ((near[0] ?? 1) > 1) out.push('gap');
  out.push(...near);
  if ((near.at(-1) ?? count - 2) < count - 2) out.push('gap');
  out.push(count - 1);
  return out;
}

/** Reference pager: "Showing x to y of n", then Previous, page numbers and Next. Page state stays with the caller's URL. */
export function MatrixPager<T>({ data, noun, onPage, sizes, onSize }: Props<T>) {
  const count = Math.max(1, Math.ceil(data.total / data.pageSize));
  const from = data.total ? data.page * data.pageSize + 1 : 0;
  const to = Math.min(data.total, (data.page + 1) * data.pageSize);
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1 }}>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Showing <strong>{from}</strong> to <strong>{to}</strong> of <strong>{data.total}</strong> {noun}
        </Typography>
        {sizes && onSize ? (
          <TextField select label="Rows" value={data.pageSize} onChange={(e) => onSize(Number(e.target.value))} sx={{ width: 88 }}>
            {sizes.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        ) : null}
      </Stack>
      <Stack component="nav" aria-label={`${noun} pages`} direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
        <Button variant="text" disabled={data.page === 0} onClick={() => onPage(data.page - 1)}>Previous</Button>
        {pageList(data.page, count).map((p, i) => (p === 'gap'
          ? <Typography key={`gap-${i}`} variant="body2" sx={{ px: 0.5, color: 'text.secondary' }}>…</Typography>
          : (
            <ButtonBase key={p} onClick={() => onPage(p)} aria-current={p === data.page ? 'page' : undefined} aria-label={`Page ${p + 1}`}
              sx={(t) => ({
                minWidth: 28, height: 28, px: 0.75, borderRadius: 0.5, fontSize: '0.75rem', fontWeight: 600,
                bgcolor: p === data.page ? t.palette.brand.navy : 'transparent', color: p === data.page ? t.palette.common.white : t.palette.brand.navy,
                '&:hover': { bgcolor: p === data.page ? t.palette.brand.navyDark : t.palette.brand.hover },
              })}>
              {p + 1}
            </ButtonBase>
          )))}
        <Button variant="outlined" disabled={data.page >= count - 1} onClick={() => onPage(data.page + 1)}>Next</Button>
      </Stack>
    </Stack>
  );
}
