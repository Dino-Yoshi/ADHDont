import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./home-page";
import { LoginPage } from "./login-page";
import { RegisterPage } from "./register-page";
import { useSession } from "./use-session";

export function App() {
  const session = useSession();

  if (session === undefined) return <p>Loading…</p>;

  // Logged-out visitors only get login and register; logged-in ones skip them.
  const isLoggedIn = session !== null;
  const fallback = <Navigate to={isLoggedIn ? "/" : "/login"} replace />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isLoggedIn ? <HomePage /> : fallback} />
        <Route path="/login" element={isLoggedIn ? fallback : <LoginPage />} />
        <Route path="/register" element={isLoggedIn ? fallback : <RegisterPage />} />
        <Route path="*" element={fallback} />
      </Routes>
    </BrowserRouter>
  );
}
