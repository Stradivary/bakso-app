import { Container } from "@mantine/core";
import { BroadcastMapPage } from "@/pages/map";
import {
  createBrowserRouter,
  Outlet,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import LoginView from "@/shared/views/LoginView";
import { Contexts } from "./_root";
import { OfflineHandler } from "../components/OfflineHandler";

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <Contexts>
        <Outlet />
        <OfflineHandler />
      </Contexts>
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
