import {AuthContext} from "react-oidc-context";
import {User} from "oidc-client-ts";
import {useContext} from "react";

const isAuthEnabled = import.meta.env.VITE_AUTH_TYPE === "jwt_oidc";

export function useUser(): User | null {
  // Directly use AuthContext instead of useAuth to avoid breaking the rules of hooks
  const authContext = useContext(AuthContext);

  if (isAuthEnabled) {
    // When auth is enabled, return the user from the auth context
    return authContext?.user || null;
  } else {
    // When auth is not enabled, simply return null
    return null;
  }
}