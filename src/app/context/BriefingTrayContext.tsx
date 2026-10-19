import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type TrayValue = { ids: string[]; add: (id: string) => void; remove: (id: string) => void; has: (id: string) => boolean; clear: () => void };

const TrayContext = createContext<TrayValue | null>(null);

/** Items queued for the briefing from anywhere in the workspace. */
export function BriefingTrayProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const value = useMemo<TrayValue>(() => ({
    ids,
    add: (id) => setIds((s) => (s.includes(id) ? s : [...s, id])),
    remove: (id) => setIds((s) => s.filter((x) => x !== id)),
    has: (id) => ids.includes(id),
    clear: () => setIds([]),
  }), [ids]);
  return <TrayContext.Provider value={value}>{children}</TrayContext.Provider>;
}

export function useBriefingTray(): TrayValue {
  const ctx = useContext(TrayContext);
  if (!ctx) throw new Error('useBriefingTray must be used inside BriefingTrayProvider');
  return ctx;
}
