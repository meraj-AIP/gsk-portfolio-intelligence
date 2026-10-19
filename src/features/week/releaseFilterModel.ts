import { useUrlParam } from '@/shared/hooks/useUrlState';
import type { Project, Release } from '@/shared/types/domain';
import type { BusinessCapability } from '@/shared/types/workflow';

/** `weeks` is empty for this week's releases only, or 'all' to include earlier weeks. */
export type ReleaseFilterValues = { programme: string; owner: string; availability: string; unresolved: string; capability: string; weeks: string };
export type ReleaseFilterKey = keyof ReleaseFilterValues;

/** Filters live in the URL so a filtered view can be shared and survives refresh. */
export function useReleaseFilters() {
  const [programme, setProgramme] = useUrlParam('programme');
  const [owner, setOwner] = useUrlParam('owner');
  const [availability, setAvailability] = useUrlParam('availability');
  const [unresolved, setUnresolved] = useUrlParam('unresolved');
  const [capability, setCapability] = useUrlParam('capability');
  const [weeks, setWeeks] = useUrlParam('weeks');
  const values: ReleaseFilterValues = { programme, owner, availability, unresolved, capability, weeks };
  const setters: Record<ReleaseFilterKey, (v: string | null) => void> = { programme: setProgramme, owner: setOwner, availability: setAvailability, unresolved: setUnresolved, capability: setCapability, weeks: setWeeks };
  return { values, set: (key: ReleaseFilterKey, value: string) => setters[key](value || null) };
}

export const isAvailable = (r: Release) => r.events.some((e) => e.kind === 'available');

/** A release belongs to a capability when the capability lists it, or when the release names that capability itself. */
function inCapability(r: Release, cap: BusinessCapability | undefined): boolean {
  return Boolean(cap && (cap.releaseIds.includes(r.id) || cap.name === r.businessCapability));
}

export function filterReleases(releases: Release[], projects: Project[], capabilities: BusinessCapability[], scopeIds: string[], f: ReleaseFilterValues, week: string): Release[] {
  const cap = capabilities.find((c) => c.id === f.capability);
  return releases.filter((r) => {
    const programmeId = projects.find((p) => p.id === r.projectId)?.programmeId;
    return scopeIds.includes(r.projectId)
      && (f.weeks === 'all' || r.week === week)
      && (!f.programme || programmeId === f.programme)
      && (!f.owner || r.owner === f.owner)
      && (!f.availability || (f.availability === 'available') === isAvailable(r))
      && (!f.unresolved || r.outstandingConditions.length > 0)
      && (!f.capability || inCapability(r, cap));
  });
}
