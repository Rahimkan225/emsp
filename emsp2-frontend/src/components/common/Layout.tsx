import { Outlet } from "react-router-dom";

import Breadcrumbs from "./Breadcrumbs";
import Footer from "./Footer";
import Navbar from "./Navbar";
import TopBar from "./TopBar";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Breadcrumbs />
        </div>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
