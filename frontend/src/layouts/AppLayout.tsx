import { Outlet } from "react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="w-screen max-w-full flex-1 py-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
