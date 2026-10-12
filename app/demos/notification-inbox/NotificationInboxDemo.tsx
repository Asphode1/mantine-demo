import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Indicator,
  Paper,
  Popover,
  ScrollArea,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import { useInterval, useListState } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconBell, IconBellOff, IconChecks, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { initialInbox, type InboxItem, randomItem } from "./inbox";
import { InboxRow } from "./InboxRow";

type Tab = "all" | "unread";

export function NotificationInboxDemo() {
  const [items, handlers] = useListState<InboxItem>(initialInbox);
  const [opened, setOpened] = useState(false);
  const [tab, setTab] = useState<Tab>("all");

  // Re-render every 30s so "x minutes ago" labels stay fresh.
  const [now, setNow] = useState(() => Date.now());
  const clock = useInterval(() => setNow(Date.now()), 30_000);
  useEffect(() => {
    clock.start();
    return clock.stop;
  }, []);

  const unreadCount = items.filter((item) => !item.read).length;
  const visible = tab === "unread" ? items.filter((item) => !item.read) : items;

  const indexOf = (id: string) => items.findIndex((item) => item.id === id);

  const open = (item: InboxItem) => {
    if (!item.read) handlers.setItemProp(indexOf(item.id), "read", true);
    notifications.show({
      title: `${item.actor} ${item.title}`,
      message: item.body,
    });
  };

  const dismiss = (item: InboxItem) => {
    handlers.remove(indexOf(item.id));
    notifications.show({ title: "Dismissed", message: `${item.actor} ${item.title}` });
  };

  const markAllRead = () => {
    handlers.apply((item) => ({ ...item, read: true }));
    notifications.show({ color: "teal", title: "All caught up", message: "Every notification marked as read." });
  };

  const simulateIncoming = () => {
    const item = randomItem();
    handlers.prepend(item);
    setNow(Date.now());
    notifications.show({
      title: "New notification",
      message: `${item.actor} ${item.title}`,
    });
  };

  return (
    <Stack maw={720}>
      <Group>
        <Button variant="light" leftSection={<IconPlus size={16} />} onClick={simulateIncoming}>
          Simulate incoming
        </Button>
        <Text size="sm" c="dimmed">
          {unreadCount} unread · {items.length} total
        </Text>
      </Group>

      {/* Fake app header hosting the bell */}
      <Paper withBorder>
        <Group justify="space-between" px="md" py="sm">
          <Text fw={700}>Acme</Text>
          <Popover
            opened={opened}
            onChange={setOpened}
            width={380}
            position="bottom-end"
            shadow="md"
            withArrow
          >
            <Popover.Target>
              <Indicator
                label={unreadCount > 9 ? "9+" : unreadCount}
                size={18}
                offset={4}
                disabled={unreadCount === 0}
                color="red"
              >
                <ActionIcon
                  variant="default"
                  size="lg"
                  aria-label={`Notifications, ${unreadCount} unread`}
                  onClick={() => setOpened((o) => !o)}
                >
                  <IconBell size={18} />
                </ActionIcon>
              </Indicator>
            </Popover.Target>
            <Popover.Dropdown p={0}>
              <Group justify="space-between" px="md" pt="sm" pb={4}>
                <Text fw={600}>Notifications</Text>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  leftSection={<IconChecks size={14} />}
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </Button>
              </Group>
              <Tabs value={tab} onChange={(value) => setTab((value as Tab) ?? "all")}>
                <Tabs.List px="xs">
                  <Tabs.Tab value="all">All</Tabs.Tab>
                  <Tabs.Tab
                    value="unread"
                    rightSection={
                      unreadCount > 0 ? (
                        <Badge size="xs" circle>
                          {unreadCount}
                        </Badge>
                      ) : undefined
                    }
                  >
                    Unread
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>
              <ScrollArea.Autosize mah={360} type="auto">
                {visible.length === 0 ? (
                  <Stack align="center" gap={4} py="xl" c="dimmed">
                    <IconBellOff size={28} stroke={1.5} />
                    <Text size="sm">
                      {tab === "unread" ? "No unread notifications" : "Your inbox is empty"}
                    </Text>
                  </Stack>
                ) : (
                  visible.map((item) => (
                    <InboxRow
                      key={item.id}
                      item={item}
                      now={now}
                      onOpen={() => open(item)}
                      onDismiss={() => dismiss(item)}
                    />
                  ))
                )}
              </ScrollArea.Autosize>
            </Popover.Dropdown>
          </Popover>
        </Group>
        <Text size="sm" c="dimmed" px="md" pb="md">
          Click the bell. Clicking a notification marks it read; hover to dismiss.
        </Text>
      </Paper>
    </Stack>
  );
}
