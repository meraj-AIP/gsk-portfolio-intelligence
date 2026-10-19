import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import Box from '@mui/material/Box';
import type { ComponentProps } from 'react';
import { KpiTile } from '@/shared/components/ui/KpiTile';
import { gbpShort } from '@/shared/lib/format';
import { costSummary } from '@/shared/lib/portfolio';
import type { Project } from '@/shared/types/domain';
import type { CompareData, Focus } from './compareRows';

type Tile = ComponentProps<typeof KpiTile>;
const pct = (a: number, b: number) => (b ? (a / b) * 100 : 0);

/** Calculated counts and totals across the selected projects for the active focus. Outcome values are counted, not added. */
export function CompareSummary({ focus, projects, data }: { focus: Focus; projects: Project[]; data: CompareData }) {
  const ids = projects.map((p) => p.id);
  const n = projects.length;
  const tiles: Record<Focus, Tile[]> = {
    delivery: (() => {
      const met = projects.filter((p) => p.position.delivery === 'met').length;
      const moved = projects.filter((p) => p.commitment.current !== p.commitment.original).length;
      const done = projects.filter((p) => p.commitment.actual).length;
      return [
        { label: 'Delivery met', value: String(met), unit: `of ${n}`, icon: <FlagOutlinedIcon fontSize="small" />, footer: 'Projects meeting their delivery commitment', progress: pct(met, n), progressTone: 'success' },
        { label: 'Dates moved', value: String(moved), unit: `of ${n}`, icon: <FlagOutlinedIcon fontSize="small" />, iconTone: moved ? 'warning' : 'neutral', footer: 'Current commitment differs from the original' },
        { label: 'Commitments done', value: String(done), unit: `of ${n}`, icon: <FlagOutlinedIcon fontSize="small" />, iconTone: 'success', footer: 'Current commitment has an actual date' },
      ];
    })(),
    releases: (() => {
      const rel = data.releases.filter((r) => ids.includes(r.projectId));
      const avail = rel.filter((r) => r.events.some((e) => e.kind === 'available')).length;
      const conditions = rel.flatMap((r) => r.outstandingConditions).length;
      return [
        { label: 'Releases recorded', value: String(rel.length), icon: <RocketLaunchOutlinedIcon fontSize="small" />, footer: `Across ${n} projects` },
        { label: 'Available to the business', value: String(avail), unit: `of ${rel.length}`, icon: <RocketLaunchOutlinedIcon fontSize="small" />, iconTone: 'success', footer: 'Releases with an availability event', progress: pct(avail, rel.length), progressTone: 'success' },
        { label: 'Outstanding conditions', value: String(conditions), icon: <RocketLaunchOutlinedIcon fontSize="small" />, iconTone: conditions ? 'warning' : 'neutral', footer: 'Conditions still attached to releases' },
      ];
    })(),
    cost: (() => {
      const c = costSummary(data.costs, ids);
      const over = c.variance > 0;
      return [
        { label: 'Budget', value: gbpShort(c.budget), icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />, footer: `Direct, FY26. Coverage ${c.coverage} of ${c.of} projects.` },
        { label: 'Forecast', value: gbpShort(c.forecast), delta: { text: `${over ? '+' : ''}${gbpShort(c.variance)}`, tone: over ? 'danger' : 'success' }, icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />, iconTone: over ? 'warning' : 'navy', footer: 'Against budget, direct costs only', progress: pct(c.forecast, c.budget), progressTone: over ? 'danger' : 'navy' },
        { label: 'Shared, excluded', value: gbpShort(c.sharedExcluded), icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />, iconTone: c.sharedExcluded ? 'warning' : 'neutral', footer: 'Kept out until Finance confirms the basis (DEF-06)' },
      ];
    })(),
    outcomes: (() => {
      const m = data.outcomes.filter((o) => ids.includes(o.projectId));
      const measured = m.filter((o) => o.actual).length;
      return [
        { label: 'Measures defined', value: String(m.length), icon: <InsightsOutlinedIcon fontSize="small" />, footer: `${new Set(m.map((o) => o.definition)).size} distinct definitions` },
        { label: 'Measured', value: String(measured), unit: `of ${m.length}`, icon: <InsightsOutlinedIcon fontSize="small" />, iconTone: 'success', footer: 'Measures with a recorded actual', progress: pct(measured, m.length), progressTone: 'success' },
        { label: 'Still forecast', value: String(m.length - measured), icon: <InsightsOutlinedIcon fontSize="small" />, iconTone: 'neutral', footer: 'Counted only. Values are not added together.' },
      ];
    })(),
  };
  return (
    <Box sx={{ display: 'grid', gap: 3, mb: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
      {tiles[focus].map((t) => <KpiTile key={t.label} {...t} />)}
    </Box>
  );
}
