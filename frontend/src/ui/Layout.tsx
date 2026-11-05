import { useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { store } from "../lib/store";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const pathname = location?.pathname;
  const getUserInfo = store((state) => state.getUserInfo);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      void getUserInfo(user?.uid);
    });
  }, [getUserInfo]);

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] primary-button">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1 min-w-0" tabIndex={-1}>
        <div key={pathname} className="motion-safe:animate-reveal">{children}</div>
      </main>
      {pathname !== "/profile" && <Footer />}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        toastOptions={{
          style: {
            backgroundColor: "rgb(var(--surface))",
            color: "rgb(var(--ink))",
            border: "1px solid rgb(var(--line))",
          },
        }}
      />
    </div>
  );
};

export default Layout;
