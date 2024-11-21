import { Container } from "@mantine/core";
import {
  createBrowserRouter,
  Outlet,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import { OfflineHandler } from "../OfflineHandler";
import { BroadcastMapPage } from "@/presentation/views/map";
import LoginView from "@/presentation/views/login/LoginView";
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
  },
});

export function RouteProvider() {
  return <RouterProvider router={router} />;
}
