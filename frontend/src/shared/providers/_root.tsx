import { AuthProvider } from "./authProvider";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { RouteProvider } from "./routeProvider";
import { OfflineHandler } from "../components/OfflineHandler";
import { ThemeProvider } from "./themeProvider";

export function Root() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RouteProvider />
        <OfflineHandler />
      </ThemeProvider>
    </AuthProvider>
  );
}
