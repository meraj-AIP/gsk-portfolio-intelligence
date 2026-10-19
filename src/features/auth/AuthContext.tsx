import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { setActor } from '@/shared/api/session';
import type { Role, User } from '@/shared/types/workflow';

export type { Role, User };

/** signedOut is true after an explicit sign-out, so the next person lands on their own page, not the last one viewed. */
type AuthValue = { user: User | null; signedOut: boolean; signIn: (user: User) => void; signOut: () => void };

const AuthContext = createContext<AuthValue | null>(null);
const KEY = 'ppi.session';

function readSession(): User | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    const user = raw ? (JSON.parse(raw) as User) : null;
    setActor(user);
    return user;
  } catch {
    return null;
  }
}

/** Session identity. In production this is populated from the Entra ID token; the session store only survives the tab. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readSession);
  const [signedOut, setSignedOut] = useState(false);
  const value = useMemo<AuthValue>(() => ({
    user,
    signedOut,
    signIn: (u) => { setActor(u); setUser(u); try { window.sessionStorage.setItem(KEY, JSON.stringify(u)); } catch { /* storage unavailable */ } },
    signOut: () => { setActor(null); setSignedOut(true); setUser(null); try { window.sessionStorage.removeItem(KEY); } catch { /* storage unavailable */ } },
  }), [user, signedOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
