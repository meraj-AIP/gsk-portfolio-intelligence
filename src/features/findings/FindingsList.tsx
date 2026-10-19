import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { Finding, FindingCategory, StatementType } from '@/shared/types/domain';
import { CONDITION_TONE } from '@/shared/components/ConditionChip';
import { EmptyState } from '@/shared/components/StatePanels';
import { FilterChips } from '@/shared/components/ui/Controls';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { CONDITION_LABEL } from '@/shared/lib/format';
import { weekNo } from '@/shared/lib/journey';
import { CATEGORY_CONDITION } from '@/shared/lib/portfolio';
import { useLifecycles, useSnapshots } from '@/shared/api/hooks';

const FILTERS: { label: string; categories: FindingCategory[] | null }[] = [
  { label: 'All', categories: null },
  { label: 'Decisions needed', categories: ['decision needed'] },
  { label: 'Delayed commitments', categories: ['delayed commitment'] },
  { label: 'Release issues', categories: ['release issue'] },
  { label: 'Cost concerns', categories: ['cost concern'] },
  { label: 'Missing information', categories: ['missing information'] },
  { label: 'Governance', categories: ['governance'] },
];

const SEVERITY: Record<FindingCategory, number> = { 'delayed commitment': 5, 'cost concern': 4, 'decision needed': 3, governance: 3, 'release issue': 2, 'missing information': 1 };

const CATEGORY_LABEL: Record<FindingCategory, string> = {
  'decision needed': 'Decision', 'delayed commitment': 'Delayed', 'release issue': 'Release', 'cost concern': 'Cost', 'missing information': 'Missing info', governance: 'Governance',
};

const STATEMENT: Record<StatementType, string> = { 'reported fact': 'Reported fact', 'calculated result': 'Calculated result', 'AI interpretation': 'AI interpretation' };

type Props = { findings: Finding[]; onOpen: (id: string) => void; showFilters?: boolean; compact?: boolean };

/** Prioritised findings. The severity chip is the only colour; everything else is a title and one line of plain text. */
export function FindingsList({ findings, onOpen, showFilters = true, compact = false }: Props) {
  const [filter, setFilter] = useState(0);
  const openWeek = useSnapshots().data?.find((s) => s.status === 'open')?.week ?? '';
  const lifecycles = useLifecycles().data;
  const active = FILTERS[filter] ?? FILTERS[0]!;
  const isNew = (f: Finding) => f.firstSeenWeek === openWeek;
  const rows = [...findings]
    .filter((f) => !active.categories || active.categories.includes(f.category))
    .sort((a, b) => SEVERITY[b.category] - SEVERITY[a.category] || Number(isNew(b)) - Number(isNew(a)));

  const meta = (f: Finding) => {
    const weeks = openWeek ? weekNo(openWeek) - weekNo(f.firstSeenWeek) + 1 : 0;
    const age = isNew(f) ? 'New this week' : weeks > 0 ? `Open ${weeks} week${weeks === 1 ? '' : 's'}` : '';
    const stage = lifecycles?.[f.id]?.stage;
    return [age, stage ? stage.charAt(0).toUpperCase() + stage.slice(1) : '', f.requestedOwner ? `Owner ${f.requestedOwner}` : ''].filter(Boolean).join('. ');
  };

  const options = FILTERS.map((f, i) => ({ value: String(i), label: f.label, count: findings.filter((x) => !f.categories || f.categories.includes(x.category)).length }));

  return (
    <Stack sx={{ gap: 1 }}>
      {showFilters ? <FilterChips label="Filter findings" options={options} value={String(filter)} onChange={(v) => setFilter(Number(v))} /> : null}
      {rows.length === 0 ? <EmptyState title="No findings in this view" hint="Change the filter or the portfolio scope." /> : null}
      {rows.map((f) => {
        const cond = CATEGORY_CONDITION[f.category];
        return (
          <ButtonBase
            key={f.id}
            onClick={() => onOpen(f.id)}
            aria-label={`${f.title}. ${CONDITION_LABEL[cond]}`}
            sx={(t) => ({ display: 'block', textAlign: 'left', width: '100%', p: compact ? 1 : 1.5, border: `1px solid ${t.palette.divider}`, borderRadius: 1, bgcolor: 'background.paper', '&:hover': { bgcolor: t.palette.brand.hover } })}
          >
            <Stack direction="row" sx={{ gap: 1.5, alignItems: 'flex-start' }}>
              <StatusChip tone={CONDITION_TONE[cond]} square>{CATEGORY_LABEL[f.category]}</StatusChip>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>{f.title}</Typography>
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.25 }}>
                  {/* Statement type leads so a reader always knows whether this is a fact, a calculation or an AI reading. */}
                  <Box component="span" sx={{ fontStyle: f.statementType === 'AI interpretation' ? 'italic' : 'normal', color: 'text.primary', fontWeight: 600 }}>{STATEMENT[f.statementType]}</Box>
                  {meta(f) ? `. ${meta(f)}` : ''}
                </Typography>
              </Box>
            </Stack>
          </ButtonBase>
        );
      })}
    </Stack>
  );
}
