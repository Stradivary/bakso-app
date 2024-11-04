import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthPage, LocationMapPage } from "../../pages";
import { ProtectedRoute } from "../components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <LocationMapPage />
      </ProtectedRoute>
    ),
  },
]);

export function RouteProvider() {
  return <RouterProvider router={router} />;
}
