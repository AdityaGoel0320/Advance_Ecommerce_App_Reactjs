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
    <>
      <Header />
      {children}
      {pathname !== "/profile" && <Footer />}
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        toastOptions={{
          style: {
            backgroundColor: "black",
            color: "white",
          },
        }}
      />
    </>
  );
};

export default Layout;
