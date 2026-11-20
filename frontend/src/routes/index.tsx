import { createBrowserRouter } from "react-router";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/layouts/AppLayout";
import CreateAccount from "@/pages/account/CreateAccount";
import Login from "@/pages/account/Login";
import ForgotPassword from "@/pages/account/ForgotPassword";
import ResetPassword from "@/pages/account/ResetPassword";
import Home from "@/pages/home/Home";
import Chart from "@/pages/chart/Chart";
import Categories from "@/pages/categories/Categories";
import Budget from "@/pages/budget/Budget";
import Settings from "@/pages/settings/Settings";
import NotFound from "@/pages/not-found/NotFound";

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: "account",
        element: <AuthLayout />,
        children: [
          { path: "create", element: <CreateAccount /> },
          { path: "login", element: <Login /> },
          { path: "password/forgot", element: <ForgotPassword /> },
        ],
      },
    ],
  },
  {
    path: "reset-password",
    element: <AuthLayout />,
    children: [{ index: true, element: <ResetPassword /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "chart", element: <Chart /> },
          { path: "categories", element: <Categories /> },
          { path: "budget", element: <Budget /> },
          { path: "settings", element: <Settings /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
