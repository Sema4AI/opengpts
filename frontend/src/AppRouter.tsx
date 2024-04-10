import { QueryClient, QueryClientProvider } from "react-query";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import App from "./App.tsx";
import { NotFound } from "./components/NotFound.tsx";
import { useAuth } from "react-oidc-context";
import { FC, ReactNode, useEffect } from "react";

const queryClient = new QueryClient();

const isAuthEnabled = import.meta.env.VITE_AUTH_TYPE === "jwt_oidc";

const AuthWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (!auth.isAuthenticated) {
    localStorage.setItem(
      "post-login-redirect-url",
      location.pathname + location.search,
    );
    return <button onClick={() => void auth.signinRedirect()}>Log in</button>;
  }

  return <>{children}</>;
};

const AuthCallbackHandler = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      // Retrieve the saved URL or default to home page
      const redirectUrl =
        localStorage.getItem("post-login-redirect-url") || "/";
      localStorage.removeItem("post-login-redirect-url"); // Clean up
      navigate(redirectUrl);
    }
  }, [auth, navigate]);

  return <div>Handling authentication...</div>;
};

export function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login/callback" element={<AuthCallbackHandler />} />
          <Route
            path="/thread/:chatId"
            element={
              <AuthWrapper>
                <App />
              </AuthWrapper>
            }
          />
          <Route
            path="/assistant/:assistantId/edit"
            element={
              <AuthWrapper>
                <App edit={true} />
              </AuthWrapper>
            }
          />
          <Route
            path="/assistant/:assistantId"
            element={
              <AuthWrapper>
                <App />
              </AuthWrapper>
            }
          />
          <Route
            path="/"
            element={
              <AuthWrapper>
                <App />
              </AuthWrapper>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
