import { useSearchParams } from 'react-router-dom';
import { DIRECTORY_DEFAULTS, type DirectoryParams } from '@/shared/api/readApi';

/** Filters, page and sort live in the URL so the directory survives refresh, back and sharing. */
export function useDirectoryUrlState(): { params: DirectoryParams; setParams: (patch: Partial<DirectoryParams>) => void } {
  const [sp, setSp] = useSearchParams();
  const params: DirectoryParams = {
    q: sp.get('q') ?? DIRECTORY_DEFAULTS.q,
    programmeId: sp.get('programme') ?? DIRECTORY_DEFAULTS.programmeId,
    stage: sp.get('stage') ?? DIRECTORY_DEFAULTS.stage,
    businessArea: sp.get('area') ?? DIRECTORY_DEFAULTS.businessArea,
    page: Number(sp.get('page') ?? DIRECTORY_DEFAULTS.page),
    pageSize: Number(sp.get('size') ?? DIRECTORY_DEFAULTS.pageSize),
    sort: (sp.get('sort') as DirectoryParams['sort'] | null) ?? DIRECTORY_DEFAULTS.sort,
  };
  const setParams = (patch: Partial<DirectoryParams>) => {
    const next = { ...params, ...patch };
    if (!('page' in patch)) next.page = 0;
    setSp((prev) => {
      const copy = new URLSearchParams(prev);
      const put = (k: string, v: string | number, d: string | number) => (String(v) === String(d) ? copy.delete(k) : copy.set(k, String(v)));
      put('q', next.q, DIRECTORY_DEFAULTS.q); put('programme', next.programmeId, DIRECTORY_DEFAULTS.programmeId); put('stage', next.stage, DIRECTORY_DEFAULTS.stage);
      put('area', next.businessArea, DIRECTORY_DEFAULTS.businessArea); put('page', next.page, DIRECTORY_DEFAULTS.page); put('size', next.pageSize, DIRECTORY_DEFAULTS.pageSize); put('sort', next.sort, DIRECTORY_DEFAULTS.sort);
      return copy;
    }, { replace: true });
  };
  return { params, setParams };
}
