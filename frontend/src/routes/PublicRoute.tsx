import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/loader/Loader";

const PublicRoute = () => {
  const { loading, user } = useAuth();

  if (loading) return <Loader />;
  if (user) return <Navigate to={"/"} replace />;

  return <Outlet />;
};

export default PublicRoute;
