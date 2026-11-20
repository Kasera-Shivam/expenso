import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Authenticating..." />;
  if (!user)
    return <Navigate to="/account/login" replace state={{ from: location }} />;

  return <Outlet />;
}
