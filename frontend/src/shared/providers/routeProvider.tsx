import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AuthPage, LocationMapPage } from "../../pages";

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <LocationMapPage />
      </ProtectedRoute>
    ),
  },
]);


export function RouteProvider() {
  return (
    <RouterProvider router={router} />
  );
}