import Header from "@/components/Header";
import { createBrowserRouter } from "react-router";
import PublicRoute from "./PublicRoute";
import AuthLayout from "@/layouts/AuthLayout";
import CreateAccount from "@/pages/account/CreateAccount";
import ProtectedRoute from "./ProtectedRoute";
import Home from "@/pages/home/Home";
import Login from "@/pages/account/Login";
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
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <Header />,
        children: [{ index: true, element: <Home /> }],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
