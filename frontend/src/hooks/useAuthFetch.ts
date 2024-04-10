import { useCallback } from 'react';
import { useUser } from './useUser';

export function useAuthFetch() {
  const user = useUser();

  const authFetch = useCallback(async (input: RequestInfo, init: RequestInit = {}) => {
    let headers: Record<string, string> = {};

    if (init.headers instanceof Headers) {
      headers = Object.fromEntries(init.headers.entries());
    } else if (Array.isArray(init.headers)) {
      headers = init.headers.reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    } else if (init.headers) {
      headers = { ...init.headers };
    }

    if (user && user.access_token) {
      headers.Authorization = `Bearer ${user.access_token}`;
    }

    return fetch(input, {...init, headers});
  }, [user]);

  return authFetch;
}
