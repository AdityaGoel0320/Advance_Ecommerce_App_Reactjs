import ReactDOM from "react-dom/client";
import {
  Outlet,
  RouterProvider,
  ScrollRestoration,
  createBrowserRouter,
} from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { getProducts } from "./lib/index.ts";
import Category from "./pages/Category.tsx";
import NotFound from "./pages/NotFound.tsx";
import Product from "./pages/Product.tsx";
import Layout from "./ui/Layout.tsx";
import Profile from "./pages/Profile.tsx";
import Cart from "./pages/Cart.tsx";
import Favorite from "./pages/Favorite.tsx";
import Success from "./pages/Success.tsx";
import Cancel from "./pages/Cancel.tsx";
import Orders from "./pages/Orders.tsx";
import IdPage from "./pages/IdPage.tsx";
import { handleImageError, handleImageLoad } from "./lib/imageFallback.ts";
import { applyTheme, readTheme } from "./lib/theme.ts";

applyTheme(readTheme());
document.addEventListener("error", handleImageError, true);
document.addEventListener("load", handleImageLoad, true);

const RouterLayout = () => {
  return (
    <Layout>
      <ScrollRestoration />
      <Outlet />
    </Layout>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RouterLayout />,
    children: [
      {
        path: "/",
        element: <App />,
        loader: getProducts,
        errorElement: (
          <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-semibold">Products are temporarily unavailable</h1>
            <p className="mt-3">Please try again in a moment.</p>
            <button className="mt-5 border px-4 py-2" onClick={() => location.reload()}>
              Retry
            </button>
          </div>
        ),
      },
      {
        path: "product",
        element: <Product />,
      },
      {
        path: "product/:id",
        element: <Product />,
      },
      {
        path: "/category",
        element: <Category />,
      },
      {
        path: "/category/:id",
        element: <Category />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/favorite",
        element: <Favorite />,
      },
      {
        path: "/orders",
        element: <Orders />,
      },
      {
        path: "/success/:sessionId",
        element: <Success />,
      },
      {
        path: "/:sessionId",
        element: <IdPage/>,
      },
      {
        path: "/cancel",
        element: <Cancel />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);
