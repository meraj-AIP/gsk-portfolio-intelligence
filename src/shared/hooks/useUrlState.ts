import { useSearchParams } from 'react-router-dom';

/** One URL search param as state, so panels and selections survive refresh and navigation. */
export function useUrlParam(key: string): [string, (value: string | null) => void] {
  const [params, setParams] = useSearchParams();
  const value = params.get(key) ?? '';
  const set = (next: string | null) => {
    setParams((prev) => {
      const copy = new URLSearchParams(prev);
      if (next === null || next === '') copy.delete(key);
      else copy.set(key, next);
      return copy;
    }, { replace: true });
  };
  return [value, set];
}
