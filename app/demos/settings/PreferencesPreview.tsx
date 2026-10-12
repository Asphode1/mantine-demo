import { Anchor, Avatar, Badge, Button, Group, Paper, Stack, Text } from "@mantine/core";

import type { Preferences } from "./preferences";

/** Applies the current preferences to a small sample UI so changes are visible immediately. */
export function PreferencesPreview({ prefs }: { prefs: Preferences }) {
  const color = prefs.accentColor;
  const gap = prefs.compact ? 6 : 14;
  const textColor = prefs.highContrast ? "var(--mantine-color-text)" : "dimmed";

  return (
    <Paper
      withBorder
      p={prefs.compact ? "sm" : "lg"}
      radius={prefs.radius}
      style={{
        fontSize: prefs.fontSize,
        borderWidth: prefs.highContrast ? 2 : undefined,
        borderColor: prefs.highContrast ? "var(--mantine-color-text)" : undefined,
        transition: prefs.reduceMotion ? "none" : "all 200ms ease",
      }}
    >
      <Stack gap={gap}>
        <Text size="xs" tt="uppercase" fw={700} c="dimmed">
          Live preview
        </Text>
        <Group gap="sm" wrap="nowrap">
          <Avatar color={color} radius={prefs.radius} variant="filled">
            AL
          </Avatar>
          <div>
            <Text fz="inherit" fw={600}>
              Ada Lovelace
            </Text>
            <Text fz="0.85em" c={textColor}>
              Commented on <b>Analytical Engine</b>
            </Text>
          </div>
        </Group>
        <Text fz="inherit" c={textColor}>
          “The engine weaves algebraic patterns just as the Jacquard loom weaves flowers.”{" "}
          <Anchor fz="inherit" c={color} underline={prefs.underlineLinks ? "always" : "hover"}>
            View thread
          </Anchor>
        </Text>
        <Group gap="xs">
          <Badge color={color} radius={prefs.radius} variant="light">
            Mention
          </Badge>
          {prefs.mentionsOnly && (
            <Badge color="gray" radius={prefs.radius} variant="outline">
              Mentions only
            </Badge>
          )}
        </Group>
        <Group gap="xs">
          <Button color={color} radius={prefs.radius} size={prefs.compact ? "xs" : "sm"}>
            Reply
          </Button>
          <Button
            color={color}
            radius={prefs.radius}
            size={prefs.compact ? "xs" : "sm"}
            variant="light"
          >
            Mark as read
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
