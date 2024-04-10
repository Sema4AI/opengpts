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

// Tailwind CSS classes for centering and styling
const centerClasses = "flex flex-col justify-center items-center h-screen";

const AuthWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();

  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  if (auth.isLoading) {
    return (
      <div className={centerClasses}>
        <div>Loading...</div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className={centerClasses}>
        <div>Oops... {auth.error.message}</div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    localStorage.setItem(
      "post-login-redirect-url",
      location.pathname + location.search,
    );
    return (
      <div className={centerClasses}>
        <button
          onClick={() => void auth.signinRedirect()}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Log in
        </button>
      </div>
    );
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

  return (
    <div className={centerClasses}>
      <div>Handling authentication...</div>
    </div>
  );
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
