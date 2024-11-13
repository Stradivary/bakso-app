import { createTheme, MantineColorsTuple, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { PropsWithChildren } from "react";

const primary: MantineColorsTuple = [
  '#ffe8ed',
  '#ffcfd7',
  '#fe9cab',
  '#fd677d',
  '#fc3a56',
  '#fb203e',
  '#fc1131',
  '#e10224',
  '#c9001f',
  '#b00018'
];

const secondary: MantineColorsTuple = [
  '#ebf4ff',
  '#d4e5fa',
  '#a3c9f7',
  '#71abf6',
  '#4b92f5',
  '#3782f5',
  '#2e7af6',
  '#2368dc',
  '#195dc5',
  '#0050ad'
];

const theme = createTheme({

  colors: {
    primary,
    secondary,
  },
  primaryColor: 'primary',
  defaultRadius: 8,
  fontFamily: "'Poppins', system-ui, sans-serif",
  headings: {
    fontFamily: "'Telkomsel Batik Sans', system-ui, sans-serif",
  }
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        {children}
        <Notifications position="top-center" />
      </ModalsProvider>
    </MantineProvider>
  );
};
