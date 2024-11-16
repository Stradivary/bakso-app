import { Container } from "@mantine/core";
import { BroadcastMapPage } from "@/pages/map";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginView from "@/shared/views/LoginView";

const router = createBrowserRouter([
  {
    path: '/',
    element: <BroadcastMapPage />,
  },
  {
    path: '/login',
    element: <LoginView />
  },
  {
    path: "*",
    element: <Container h="100dvh">
      <h1>Oops, halaman tidak ditemukan</h1>

      <p>
        <a href="/">Kembali ke halaman utama</a>
      </p>
    </Container>,
  }
], {
  future: {
    v7_relativeSplatPath: true,
  }
});

export function RouteProvider() {
  return <RouterProvider router={router} />;
}
