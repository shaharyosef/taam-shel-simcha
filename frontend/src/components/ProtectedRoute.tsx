import { useEffect, useState, ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp;
      const isExpired = Date.now() >= exp * 1000;
      setIsAuthenticated(!isExpired);
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) return null; // טוען או בודק...

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
