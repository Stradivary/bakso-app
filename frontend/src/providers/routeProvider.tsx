import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Register, MainPage, CustomerPage } from "../pages";

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <Register />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <CustomerPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/maps',
    element: <CustomerPage />,
  },

]);


export function RouteProvider() {
  return (
    <RouterProvider router={router}  />
  );
}