import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { entityRoute } from '@/shared/lib/format';
import { useUrlParam } from '@/shared/hooks/useUrlState';

/** Resolves an ID to the right destination: a route for records, a panel for findings and evidence. */
export function EntityLink({ id, label }: { id: string; label?: string }) {
  const [, setFinding] = useUrlParam('finding');
  const [, setEvidence] = useUrlParam('evidence');
  const text = label ?? id;
  if (id.startsWith('F-')) return <Link component="button" type="button" variant="body2" onClick={() => setFinding(id)}>{text}</Link>;
  if (id.startsWith('E-')) return <Link component="button" type="button" variant="body2" onClick={() => setEvidence(id)}>{text}</Link>;
  const route = entityRoute(id);
  if (!route) return <span>{text}</span>;
  return <Link component={RouterLink} to={route} variant="body2">{text}</Link>;
}
