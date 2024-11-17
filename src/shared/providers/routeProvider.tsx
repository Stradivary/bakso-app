import { BroadcastMapPage } from "@/pages/map";
import LoginView from "@/shared/views/LoginView";
import { Container } from "@mantine/core";
import {
  createBrowserRouter,
  Outlet,
  RouteObject,
  RouterProvider,
} from "react-router-dom";
import { OfflineHandler } from "../components/OfflineHandler";
import { ThemeProvider } from "./themeProvider";

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ThemeProvider>
        <Outlet />
        <OfflineHandler />
      </ThemeProvider>
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
