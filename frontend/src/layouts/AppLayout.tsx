import React from "react";
import { Outlet } from "react-router";
import Header from "@/components/Header";

const AppLayout = () => {
  return (
    <React.Fragment>
      <Header />
      <main className="w-screen max-w-full py-5">
        <Outlet />
      </main>
    </React.Fragment>
  );
};

export default AppLayout;
