import { Navigate, useLocation, useParams } from 'react-router-dom';

type Props = {
  to: string;
  /** Params to set on top of the incoming query string. */
  set?: Record<string, string>;
  /** Incoming params to rename, so old links keep their meaning under the new contract. */
  rename?: Record<string, string>;
};

/** Old destinations now live as tabs or panels. Redirect while keeping every query param so shared links still work. */
export function QueryRedirect({ to, set = {}, rename = {} }: Props) {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  Object.entries(rename).forEach(([from, next]) => {
    const value = params.get(from);
    params.delete(from);
    if (value !== null) params.set(next, value);
  });
  Object.entries(set).forEach(([k, v]) => params.set(k, v));
  const query = params.toString();
  return <Navigate to={`${to}${query ? `?${query}` : ''}`} replace />;
}

export function ReleaseRedirect() {
  const { id = '' } = useParams();
  return <QueryRedirect to="/this-week" set={{ tab: 'releases', ...(id ? { release: id } : {}) }} />;
}
