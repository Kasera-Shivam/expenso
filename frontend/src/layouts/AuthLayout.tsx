import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <main className="flex w-screen max-w-full justify-center">
      <Outlet />
    </main>
  );
};

export default AuthLayout;
