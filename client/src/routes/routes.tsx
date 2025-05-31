import App from "@/pages/App";
import Home from "@/pages/Home";
import ProtectedRoute from "@/components/AuthWrapper";
import PrivateRoute from "@/components/PrivateRoute";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PrivateRoute>
        <App />
      </PrivateRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
  },
  {
    path: '/xpenza-ai',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    )
  }

]);
