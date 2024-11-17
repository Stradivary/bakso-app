import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@fontsource/poppins/index.css";

import { AuthProvider } from "./authProvider";
import { RouteProvider } from "./routeProvider";
import { ThemeProvider } from "./themeProvider";
import { PropsWithChildren } from "react";

export function Contexts({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  );
}

export function Root() {
  return <RouteProvider />;
}
