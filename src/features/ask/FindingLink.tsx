import Link from '@mui/material/Link';
import { useSearchParams } from 'react-router-dom';

/** Opens a finding's journey from Ask and closes Ask, so the journey is not left hidden underneath the Ask panel. */
export function FindingLink({ id }: { id: string }) {
  const [, setParams] = useSearchParams();
  const open = () => setParams((prev) => {
    const next = new URLSearchParams(prev);
    next.delete('ask');
    next.delete('q');
    next.set('finding', id);
    return next;
  }, { replace: true });
  return <Link component="button" type="button" variant="body2" onClick={open}>{id}</Link>;
}
