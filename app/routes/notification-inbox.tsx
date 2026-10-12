import { Container } from "@mantine/core";

import { DemoHeader } from "~/components/DemoHeader";
import { NotificationInboxDemo } from "~/demos/notification-inbox/NotificationInboxDemo";
import { getDemo } from "~/demos/registry";

export const meta = () => [{ title: `${getDemo("notification-inbox").title} · Mantine demos` }];

export default function NotificationInboxDemoRoute() {
  return (
    <Container size="lg" py="md">
      <DemoHeader slug="notification-inbox" />
      <NotificationInboxDemo />
    </Container>
  );
}
