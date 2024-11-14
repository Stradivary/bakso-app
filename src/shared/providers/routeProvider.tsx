import { BroadcastMapPage } from "@/pages/map";
import { Container } from "@mantine/core";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "@/pages/login";

const router = createBrowserRouter([
  {
    path: '/',
    element: <BroadcastMapPage />,
  },
  {
    path: '/login',
    element: <LoginPage />
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
