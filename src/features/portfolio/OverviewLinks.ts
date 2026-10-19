import { useLocation } from 'react-router-dom';

/**
 * Builds a link that opens a contextual panel or tab on the current page by adding params to the current query string,
 * so the review, scope and any open panel survive the click.
 */
export function usePanelHref() {
  const { pathname, search } = useLocation();
  return (patch: Record<string, string>, path = pathname) => {
    const params = new URLSearchParams(path === pathname ? search : '');
    Object.entries(patch).forEach(([k, v]) => params.set(k, v));
    return `${path}?${params.toString()}`;
  };
}
