import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

const PublicRoute = () => {
  const { loading, user } = useAuth();

  if (loading) return <Loader label="Authenticating..." />;
  if (user) return <Navigate to={"/"} replace />;

  return <Outlet />;
};

export default PublicRoute;
