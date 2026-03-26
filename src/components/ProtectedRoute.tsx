import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "buyer" | "seller" | "admin";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    const redirectTo = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/signin?redirectTo=${redirectTo}`} replace />;
  }

  if (requiredRole && currentUser.accountType !== requiredRole && currentUser.accountType !== "admin") {
    const fallback =
      currentUser.accountType === "admin"
        ? "/admin"
        : currentUser.accountType === "seller"
          ? "/seller-dashboard"
          : "/buyer-dashboard";

    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
