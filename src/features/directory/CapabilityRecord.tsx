import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCapabilities } from '@/shared/api/hooks';
import { EntityLink } from '@/shared/components/EntityLink';
import { KeyValueList } from '@/shared/components/KeyValueList';
import { EmptyState, ErrorState, LoadingState } from '@/shared/components/StatePanels';
import type { Release } from '@/shared/types/domain';

/** The business capability each release feeds. Matched by release name or by the capability's own project list, because the two sources do not always use the same name. */
export function CapabilityRecord({ projectId, releases }: { projectId: string; releases: Release[] }) {
  const capabilities = useCapabilities();
  if (capabilities.isError) return <ErrorState message="Business capabilities could not be loaded." onRetry={() => void capabilities.refetch()} />;
  if (capabilities.isLoading) return <LoadingState rows={2} />;
  const names = new Set(releases.map((r) => r.businessCapability));
  const matched = (capabilities.data ?? []).filter((c) => names.has(c.name) || c.projectIds.includes(projectId));
  if (!matched.length) return <EmptyState title="No business capability recorded" hint="Releases from this project are not yet linked to a capability the business uses." />;
  return (
    <Stack sx={{ gap: 2 }}>
      {matched.map((c) => (
        <Stack key={c.id} sx={{ gap: 0.5 }}>
          <Typography variant="subtitle2">{c.name}</Typography>
          <KeyValueList columns={3} items={[
            { label: 'Intended users', value: c.intendedUsers },
            { label: 'Contributing projects', value: <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>{c.projectIds.map((id) => <EntityLink key={id} id={id} />)}</Stack> },
            { label: 'Releases', value: <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>{c.releaseIds.map((id) => <EntityLink key={id} id={id} />)}</Stack> },
          ]} />
        </Stack>
      ))}
    </Stack>
  );
}
