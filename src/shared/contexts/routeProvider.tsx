import { Container } from "@mantine/core";
import {
  createBrowserRouter,
  Outlet,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import { OfflineHandler } from "@/views/components/OfflineHandler";
import { BroadcastMapPage } from "@/views/map";
import LoginView from "@/views/login/LoginView";
const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <>
        <Outlet />
        <OfflineHandler />
      </>
    ),
    children: [
      {
        index: true,
        element: <BroadcastMapPage />,
      },
      {
        path: "/login",
        element: <LoginView />,
      },
      {
        path: "*",
        element: (
          <Container h="100dvh">
            <h1>Oops, halaman tidak ditemukan</h1>

            <p>
              <a href="/">Kembali ke halaman utama</a>
            </p>
          </Container>
        ),
      },
    ] satisfies RouteObject[],
  },
] satisfies RouteObject[];

const router = createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true,
    v7_normalizeFormMethod: true,
    v7_skipActionErrorRevalidation: true,
    v7_fetcherPersist: true,
  },
});

export function RouteProvider() {
  return <RouterProvider router={router} />;
}
