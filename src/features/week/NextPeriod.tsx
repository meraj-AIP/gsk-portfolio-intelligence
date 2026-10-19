import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { SectionCard } from '@/shared/components/SectionCard';
import { formatDate } from '@/shared/lib/format';
import type { Commitment, Dependency } from '@/shared/types/domain';
import type { ReviewPeriod } from './weekModel';

type Props = { commitments: Commitment[]; dependencies: Dependency[] | undefined; dependenciesFailed: boolean; projectIds: string[]; period: ReviewPeriod };

function Line({ date, children }: { date: string; children: ReactNode }) {
  return (
    <Stack direction="row" sx={{ gap: 1.5, py: 0.75, borderTop: 1, borderColor: 'divider', alignItems: 'baseline' }}>
      <Typography variant="label" sx={{ minWidth: 84, color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}>{formatDate(date)}</Typography>
      <Typography variant="body2" sx={{ minWidth: 0 }}>{children}</Typography>
    </Stack>
  );
}

/** What the following review will pick up: recorded commitments after this week and dependencies still unmet. */
export function NextPeriod({ commitments, dependencies, dependenciesFailed, projectIds, period }: Props) {
  const next = commitments.filter((c) => c.week > period.week && projectIds.includes(c.projectId));
  const openDeps = (dependencies ?? []).filter((d) => d.position !== 'met' && d.requiredDate >= period.end);
  const quiet = (text: string) => <Typography variant="body2" sx={{ color: 'text.secondary', py: 0.75, borderTop: 1, borderColor: 'divider' }}>{text}</Typography>;
  return (
    <SectionCard title="Next period" subtitle="What the following review picks up." dense>
      <Typography variant="overline" component="p" sx={{ mb: 0.5 }}>Recorded upcoming commitments ({next.length})</Typography>
      {next.length ? next.map((c) => <Line key={c.id} date={c.currentDate}>{c.title} <Box component="span" sx={{ color: 'text.secondary' }}>({c.owner})</Box></Line>) : quiet('None recorded.')}
      <Typography variant="overline" component="p" sx={{ mt: 2, mb: 0.5 }}>Unresolved dependencies due{dependencies ? ` (${openDeps.length})` : ''}</Typography>
      {dependenciesFailed ? quiet('Dependencies could not be loaded.') : !dependencies ? quiet('Loading dependencies.') : !openDeps.length ? quiet('None due.') : null}
      {openDeps.map((d) => <Line key={d.id} date={d.requiredDate}>{d.id} {d.description.slice(0, 70)}{d.description.length > 70 ? '...' : ''}</Line>)}
    </SectionCard>
  );
}
