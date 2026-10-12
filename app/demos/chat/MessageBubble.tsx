import { Avatar, Group, Paper, Stack, Text } from "@mantine/core";

import { type Message, participants, timeFormat } from "./messages";

export function MessageBubble({ message }: { message: Message }) {
  const mine = message.author === "me";
  const person = participants[message.author];

  return (
    <Group
      align="flex-end"
      gap="xs"
      wrap="nowrap"
      justify={mine ? "flex-end" : "flex-start"}
      style={{ flexDirection: mine ? "row-reverse" : "row" }}
    >
      <Avatar color={person.color} radius="xl" size="sm" aria-label={person.name}>
        {person.initials}
      </Avatar>
      <Stack gap={2} maw="75%" align={mine ? "flex-end" : "flex-start"}>
        <Paper
          px="sm"
          py={6}
          radius="lg"
          bg={mine ? "var(--mantine-primary-color-filled)" : "var(--mantine-color-default-hover)"}
          c={mine ? "var(--mantine-primary-color-contrast)" : undefined}
          style={{
            borderBottomRightRadius: mine ? 4 : undefined,
            borderBottomLeftRadius: mine ? undefined : 4,
          }}
        >
          <Text size="sm" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {message.text}
          </Text>
        </Paper>
        <Text size="xs" c="dimmed">
          {timeFormat.format(message.sentAt)}
        </Text>
      </Stack>
    </Group>
  );
}
