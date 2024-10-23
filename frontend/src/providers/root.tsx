import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "./authProvider";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { RouteProvider } from "./routeProvider";


export function Root() {
  return (
    <AuthProvider>
      <MantineProvider theme={{ primaryColor: "red" }}>
        <RouteProvider />
        <Notifications />
      </MantineProvider>
    </AuthProvider>
  );
}

