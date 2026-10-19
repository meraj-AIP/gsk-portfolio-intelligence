import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useSearchParams } from 'react-router-dom';
import { AuditTrail } from '@/features/audit/AuditTrail';
import { PageHeader } from '@/shared/components/PageHeader';
import { SourcesTab } from './SourcesTab';

type TabKey = 'sources' | 'audit';

// Filters belong to one tab; carrying them across would silently filter the other tab's list.
const TAB_PARAMS: Record<TabKey, string[]> = { sources: ['issue'], audit: ['q', 'kind', 'page', 'size'] };

/** S14. Sources and information quality, with the audit trail as a second tab so provenance lives in one place. */
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
      <PageHeader title="Sources and quality"
        subtitle={tab === 'sources'
          ? 'What each source supplies, who owns it, which fields it is authoritative for, and what is missing or in conflict. A newer value never silently overrides an authoritative one; corrections keep their provenance.'
          : 'Every change made in the workspace, with the user, their role, the record, the evidence version they acted on and the inputs they supplied.'} />
      <Tabs value={tab} onChange={(_, v: TabKey) => select(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab value="sources" label="Sources" />
        <Tab value="audit" label="Audit trail" />
      </Tabs>
      {tab === 'audit' ? <AuditTrail /> : <SourcesTab />}
    </>
  );
}
