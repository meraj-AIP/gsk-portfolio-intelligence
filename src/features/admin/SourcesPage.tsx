import Typography from '@mui/material/Typography';
import { useSearchParams } from 'react-router-dom';
import { AuditTrail } from '@/features/audit/AuditTrail';
import { useSources } from '@/shared/api/hooks';
import { PageHeader } from '@/shared/components/PageHeader';
import { SegmentedToggle } from '@/shared/components/ui/Controls';
import { StatusChip } from '@/shared/components/ui/StatusChip';
import { openIssues } from './sourceIssues';
import { SourcesTab } from './SourcesTab';

type TabKey = 'sources' | 'audit';

// Filters belong to one tab; carrying them across would silently filter the other tab's list.
const TAB_PARAMS: Record<TabKey, string[]> = { sources: ['issue'], audit: ['q', 'kind', 'page', 'size'] };

/** One line on the state of the feeds, from the same records as the KPI row. */
function Summary() {
  const sources = useSources();
  if (sources.isError) return <Typography variant="overline">Source status could not be loaded</Typography>;
  if (!sources.data) return <Typography variant="overline">Checking sources</Typography>;
  const unhealthy = sources.data.filter((s) => s.connectionHealth !== 'healthy').length;
  const open = openIssues(sources.data).length;
  return (
    <>
      <StatusChip tone={unhealthy ? 'warning' : 'success'}>{unhealthy ? `${unhealthy} ${unhealthy === 1 ? 'feed needs' : 'feeds need'} attention` : 'All feeds connected'}</StatusChip>
      <Typography variant="overline">{sources.data.length} sources, {open} open issue{open === 1 ? '' : 's'}</Typography>
    </>
  );
}

/** S14. Sources and information quality, with the audit trail as a second view so provenance lives in one place. */
export function SourcesPage() {
  const [params, setParams] = useSearchParams();
  const tab: TabKey = params.get('tab') === 'audit' ? 'audit' : 'sources';
  const select = (next: TabKey) => setParams((prev) => {
    const copy = new URLSearchParams(prev);
    TAB_PARAMS[tab].forEach((k) => copy.delete(k));
    copy.set('tab', next);
    return copy;
  }, { replace: true });

  return (
    <>
      <PageHeader eyebrow={<Summary />} title="Sources and quality"
        subtitle={tab === 'sources'
          ? 'What each source supplies, who owns it, which fields it is authoritative for, and what is missing or in conflict. A newer value never silently overrides an authoritative one; corrections keep their provenance.'
          : 'Every change made in the workspace, with the user, their role, the record, the evidence version they acted on and the inputs they supplied.'}
        actions={<SegmentedToggle label="Sources views" value={tab} onChange={(v) => select(v as TabKey)} options={[{ value: 'sources', label: 'Sources' }, { value: 'audit', label: 'Audit trail' }]} />} />
      {tab === 'audit' ? <AuditTrail /> : <SourcesTab />}
    </>
  );
}
