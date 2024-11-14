
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@fontsource/poppins/index.css";

import { AuthProvider } from "./authProvider";
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
