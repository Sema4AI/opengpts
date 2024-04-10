import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import { NotFound } from "./components/NotFound.tsx";
import { useAuth } from "react-oidc-context";
import { FC, ReactNode } from "react";

const queryClient = new QueryClient();

const isAuthEnabled = import.meta.env.VITE_AUTH_TYPE === "jwt_oidc";

const AuthWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();

  if (!isAuthEnabled) {
    // auth is not enabled or initialized, render children directly
    return <>{children}</>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (!auth.isAuthenticated) {
    return <button onClick={() => void auth.signinRedirect()}>Log in</button>;
  }

  return <>{children}</>;
};

export function AppRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
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
