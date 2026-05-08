import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { getAdminHomePath, limitedAdminRoles } from "../../config/adminPortal";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    const path = location.pathname || "/";
    const isStudent = user?.role === "etudiant";
    const isAdminFamily = limitedAdminRoles.includes((user?.role || "etudiant") as (typeof limitedAdminRoles)[number]);

    if (path.startsWith("/admin") && isStudent) {
      return <Navigate to="/etudiant/dashboard" replace />;
    }

    if (path.startsWith("/etudiant") && isAdminFamily) {
      return <Navigate to={getAdminHomePath(user?.role)} replace />;
    }

    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
