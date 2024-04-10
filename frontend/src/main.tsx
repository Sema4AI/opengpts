import ReactDOM from "react-dom/client";
import { v4 as uuidv4 } from "uuid";
import "./index.css";
import { StrictMode } from "react";
import { AuthProvider } from "react-oidc-context";
import { AppRouter } from "./AppRouter.tsx";

function getCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return cookie ? cookie.split("=")[1] : null;
}

document.addEventListener("DOMContentLoaded", () => {
  const userId =
    localStorage.getItem("opengpts_user_id") ||
    getCookie("opengpts_user_id") ||
    uuidv4();

  // Push the user id to localStorage in any case to make it stable
  localStorage.setItem("opengpts_user_id", userId);
  // Ensure the cookie is always set (for both new and returning users)
  const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
  const expires = new Date(Date.now() + weekInMilliseconds).toUTCString();
  document.cookie = `opengpts_user_id=${userId}; path=/; expires=${expires}; SameSite=Lax;`;
});

const isAuthEnabled = import.meta.env.VITE_AUTH_TYPE === "jwt_oidc";

const oidcConfig = isAuthEnabled
  ? {
      authority: import.meta.env.VITE_OIDC_AUTHORITY,
      client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
      redirect_uri: `${window.location.origin}/login/callback`,
    }
  : {};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <AppRouter />
    </AuthProvider>
  </StrictMode>,
);
