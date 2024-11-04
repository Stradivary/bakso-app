import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { PropsWithChildren } from "react";

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <MantineProvider theme={{ primaryColor: "red" }}>
      <ModalsProvider>
        {children}
        <Notifications position="top-center" />
      </ModalsProvider>
    </MantineProvider>
  );
};
