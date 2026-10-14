import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/code-highlight/styles.css";

import {
  Button,
  Center,
  Code,
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { theme } from "./theme";

export const meta: Route.MetaFunction = () => [{ title: "Mantine demos" }];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript defaultColorScheme="auto" />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Notifications position="top-right" />
          {children}
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return null;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Center mih="100vh" p="md">
      <Stack align="center" maw={720}>
        <Title order={1}>{message}</Title>
        <Text c="dimmed">{details}</Text>
        {stack && (
          <Code block w="100%">
            {stack}
          </Code>
        )}
        <Button component={Link} to="/" variant="light">
          Back to demos
        </Button>
      </Stack>
    </Center>
  );
}
