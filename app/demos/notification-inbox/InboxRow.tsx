import { Avatar, Box, CloseButton, Group, Text, UnstyledButton } from "@mantine/core";

import { initials, kindColors, timeAgo, type InboxItem } from "./inbox";
import classes from "./InboxRow.module.css";

type InboxRowProps = {
  item: InboxItem;
  now: number;
  onOpen: () => void;
  onDismiss: () => void;
};

export function InboxRow({ item, now, onOpen, onDismiss }: InboxRowProps) {
  return (
    <div className={classes.row} data-unread={!item.read || undefined}>
      <UnstyledButton
        onClick={onOpen}
        style={{ flex: 1, display: "flex", gap: "var(--mantine-spacing-sm)", minWidth: 0 }}
        aria-label={`${item.actor} ${item.title}${item.read ? "" : ", unread"}`}
      >
        <Avatar color={kindColors[item.kind]} radius="xl" size="md">
          {initials(item.actor)}
        </Avatar>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" lineClamp={2}>
            <Text span fw={600} inherit>
              {item.actor}
            </Text>{" "}
            {item.title}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {item.body}
          </Text>
          <Group gap={6} mt={2}>
            <Text size="xs" c="dimmed">
              {timeAgo(item.createdAt, now)}
            </Text>
            {!item.read && (
              <Box w={8} h={8} bg="var(--mantine-primary-color-filled)" style={{ borderRadius: 8 }} />
            )}
          </Group>
        </Box>
      </UnstyledButton>
      <CloseButton
        className={classes.dismiss}
        size="sm"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      />
    </div>
  );
}
