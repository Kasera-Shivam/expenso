import { createBrowserRouter } from "react-router";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "@/layouts/AuthLayout";
import CreateAccount from "@/pages/auth/CreateAccount";
import Login from "@/pages/auth/Login";
import Home from "@/pages/home/Home";
import NotFound from "@/pages/not-found/NotFound";

const router = createBrowserRouter([
  {
    // element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/account/create", element: <CreateAccount /> },
          { path: "/account/login", element: <Login /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/", element: <Home /> }],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
