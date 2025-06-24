import { useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = {
  children: ReactNode;
};

const RequireAuth = ({ children }: Props) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("❌ No token found");
      setIsValid(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp;
      const expired = Date.now() >= exp * 1000;
      console.log("✅ Token found. Expired?", expired);
      setIsValid(!expired);
    } catch (err) {
      console.log("⚠️ Token invalid:", err);
      setIsValid(false);
    }
  }, [localStorage.getItem("token")]); 

  if (isValid === null) {
    return <div className="p-6 text-center text-gray-400">בודק הרשאות...</div>;
  }

  return isValid ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export default RequireAuth;
