/* eslint-disable react/prop-types */
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  Link,
  useRouteError,
} from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/register";
import Home from "./pages/home";
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import Notifications from "./pages/notifications";
import Connections from "./pages/connections";
import FeaturePage from "./pages/featurePage";
import Messages from "./pages/messages";
import Saved from "./pages/saved";
import InteractionLayer from "./components/InteractionLayer";
import Navbar from "./components/Navbar";
import Leftbar from "./components/Leftbar";
import Rightbar from "./components/Rightbar";
import { Suspense, lazy, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const AmbientScene = lazy(() => import("./components/AmbientScene"));

function App() {
  const { currentUser } = useContext(AuthContext);

  const RouteError = () => {
    const error = useRouteError();
    console.error(error);

    return (
      <main className="uks-auth-page">
        <section className="uks-auth-copy">
          <div className="uks-auth-logo">
            <span>U</span>
            <strong>Uks15</strong>
          </div>
          <h1>Something needs a refresh.</h1>
          <p>
            The page could not load cleanly. This can happen after a database reset
            or an old profile link.
          </p>
          <Link className="uks-primary-btn" to="/">
            Back to home
          </Link>
        </section>
      </main>
    );
  };

  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <Suspense fallback={null}>
            <AmbientScene />
          </Suspense>
          <InteractionLayer />
          <Navbar />
          <main className="uks-app-shell">
            <Leftbar />
            <section className="uks-main-column">
              <Outlet />
            </section>
            <Rightbar />
          </main>
        </ToastProvider>
      </QueryClientProvider>
    );
  };

  const ProtectedRoute = ({ children }) => {
    if (currentUser === null) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      errorElement: <RouteError />,
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/", element: <Home /> },
        { path: "/home", element: <Home /> },
        { path: "/profile/:id", element: <Profile /> },
        {
          path: "/notifications",
          element: <Notifications />,
        },
        {
          path: "/friends",
          element: <Connections />,
        },
        {
          path: "/groups",
          element: <FeaturePage type="community" />,
        },
        {
          path: "/marketplace",
          element: <FeaturePage type="market" />,
        },
        {
          path: "/videos",
          element: <FeaturePage type="clip" />,
        },
        {
          path: "/events",
          element: <FeaturePage type="event" />,
        },
        {
          path: "/messages",
          element: <Messages />,
        },
        {
          path: "/messages/:userId",
          element: <Messages />,
        },
        {
          path: "/saved",
          element: <Saved />,
        },
        {
          path: "/settings",
          element: <Settings />,
        },
      ],
    },
    { path: "/login", element: <Login />, errorElement: <RouteError /> },
    { path: "/register", element: <Register />, errorElement: <RouteError /> },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
