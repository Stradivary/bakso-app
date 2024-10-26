import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { AuthPage, CustomerPage } from "../../pages";

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <CustomerPage />
      </ProtectedRoute>
    ),
  },
]);


export function RouteProvider() {
  return (
    <RouterProvider router={router} />
  );
}