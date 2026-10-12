import { Container } from "@mantine/core";

import { DemoHeader } from "~/components/DemoHeader";
import { ChatDemo } from "~/demos/chat/ChatDemo";
import { getDemo } from "~/demos/registry";

export const meta = () => [{ title: `${getDemo("chat").title} · Mantine demos` }];

export default function ChatDemoRoute() {
  return (
    <Container size="lg" py="md">
      <DemoHeader slug="chat" />
      <ChatDemo />
    </Container>
  );
}
