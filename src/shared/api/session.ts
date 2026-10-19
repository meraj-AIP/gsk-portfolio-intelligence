import type { User } from '@/shared/types/workflow';

let current: User | null = null;

/**
 * The identity the "server" acts for. Set by the auth provider from the session, never passed by a component,
 * so a screen cannot claim to be someone else. In production this comes from the Entra ID token on each request.
 */
export function setActor(user: User | null): void {
  current = user;
}

export function getActor(): User | null {
  return current;
}
