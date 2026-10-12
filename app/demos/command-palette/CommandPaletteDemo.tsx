import {
  Button,
  Group,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import {
  useClipboard,
  useDisclosure,
  useHotkeys,
  useLocalStorage,
} from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { spotlight } from "@mantine/spotlight";
import { useCallback, useMemo, useState } from "react";

import { ShortcutKbd } from "~/components/ShortcutKbd";

import { buildCommands, buildViewCommands } from "./commands";
import { CompoundPalette } from "./CompoundPalette";
import { fakePages } from "./pages";
import { SearchTrigger } from "./SearchTrigger";
import { SimplePalette } from "./SimplePalette";
import type { Command, CommandContext, FakePageId, PaletteView } from "./types";

const RECENT_LIMIT = 5;

export function CommandPaletteDemo() {
  const [mode, setMode] = useState<"compound" | "simple">("compound");
  const [page, setPage] = useState<FakePageId>("dashboard");
  const [view, setView] = useState<PaletteView>("root");
  const [query, setQuery] = useState("");
  const [recentIds, setRecentIds] = useLocalStorage<string[]>({
    key: "command-palette:recent",
    defaultValue: [],
  });

  const [settingsOpened, settings] = useDisclosure(false);
  const [shortcutsOpened, shortcuts] = useDisclosure(false);
  const clipboard = useClipboard();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedScheme = useComputedColorScheme("light");

  const ctx = useMemo<CommandContext>(
    () => ({
      goTo: (target) => {
        setPage(target);
        notifications.show({
          title: "Navigated",
          message: `Opened ${fakePages[target].title}.`,
        });
      },
      setColorScheme,
      toggleColorScheme: () => {
        const next = computedScheme === "dark" ? "light" : "dark";
        setColorScheme(next);
        notifications.show({ title: "Color scheme", message: `Switched to ${next} mode.` });
      },
      copyLink: () => {
        clipboard.copy(window.location.href);
        notifications.show({
          color: "teal",
          title: "Link copied",
          message: window.location.href,
        });
      },
      openSettings: settings.open,
      openShortcuts: shortcuts.open,
      clearRecent: () => {
        setRecentIds([]);
        notifications.show({ title: "Recent cleared", message: "History was reset." });
      },
    }),
    [clipboard, computedScheme, setColorScheme, setRecentIds, settings.open, shortcuts.open],
  );

  const commands = useMemo(() => buildCommands(ctx), [ctx]);
  const viewCommands = useMemo(() => buildViewCommands(ctx), [ctx]);

  const commandsById = useMemo(() => {
    const all = [...commands, ...Object.values(viewCommands).flat()];
    return new Map(all.map((command) => [command.id, command]));
  }, [commands, viewCommands]);

  const recent = recentIds
    .map((id) => commandsById.get(id))
    .filter((command): command is Command => Boolean(command));

  /** Single entry point for palette clicks and direct hotkeys. */
  const execute = useCallback(
    (command: Command) => {
      if (command.opensView) {
        setView(command.opensView);
        setQuery("");
        spotlight.open();
        return;
      }
      // Record before running so commands that reset history ("Clear recent") win.
      setRecentIds((ids) =>
        [command.id, ...ids.filter((id) => id !== command.id)].slice(0, RECENT_LIMIT),
      );
      command.run();
      spotlight.close();
    },
    [setRecentIds],
  );

  useHotkeys(
    commands
      .filter((command) => command.shortcut)
      .map((command) => [
        command.shortcut!,
        () => execute(command),
        { usePhysicalKeys: true },
      ]),
  );

  const shortcutRows = [
    { label: "Open command palette", shortcut: "mod+K" },
    { label: "Open command palette", shortcut: "/" },
    ...commands
      .filter((command) => command.shortcut)
      .map((command) => ({ label: command.label, shortcut: command.shortcut! })),
  ];

  return (
    <Stack>
      <Group justify="space-between">
        <SegmentedControl
          value={mode}
          onChange={(value) => {
            setMode(value as typeof mode);
            notifications.show({
              title: "Palette mode",
              message:
                value === "compound"
                  ? "Using Spotlight.Root with custom filtering, recents and nested views."
                  : "Using <Spotlight actions> with the built-in filter.",
            });
          }}
          data={[
            { label: "Compound mode", value: "compound" },
            { label: "Simple mode", value: "simple" },
          ]}
        />
        <Button variant="subtle" onClick={shortcuts.open}>
          View shortcuts
        </Button>
      </Group>

      {/* Fake product frame the palette operates on. */}
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <Group
          px="md"
          py="sm"
          justify="space-between"
          wrap="nowrap"
          style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
        >
          <Text fw={700}>Acme</Text>
          <SearchTrigger />
        </Group>
        <Stack p="xl" gap="xs" mih={260}>
          <Text size="xs" tt="uppercase" fw={600} c="dimmed">
            Current page
          </Text>
          <Title order={3}>{fakePages[page].title}</Title>
          <Text c="dimmed">{fakePages[page].body}</Text>
          <Text size="sm" mt="md">
            Press <ShortcutKbd shortcut="mod+K" /> or <ShortcutKbd shortcut="/" /> to
            open the palette, or use a direct shortcut such as{" "}
            <ShortcutKbd shortcut="alt+shift+L" /> to toggle the color scheme.
          </Text>
          {recent.length > 0 && (
            <Text size="sm" c="dimmed">
              Recent: {recent.map((command) => command.label).join(" · ")}
            </Text>
          )}
        </Stack>
      </Paper>

      {mode === "compound" ? (
        <CompoundPalette
          commands={commands}
          viewCommands={viewCommands}
          recent={recent}
          view={view}
          onViewChange={setView}
          query={query}
          onQueryChange={setQuery}
          execute={execute}
        />
      ) : (
        <SimplePalette commands={commands} execute={execute} />
      )}

      <Modal opened={settingsOpened} onClose={settings.close} title="Settings">
        <Stack>
          <div>
            <Text size="sm" fw={500} mb={6}>
              Color scheme
            </Text>
            <SegmentedControl
              fullWidth
              value={colorScheme}
              onChange={(value) => {
                setColorScheme(value as "light" | "dark" | "auto");
                notifications.show({ title: "Theme changed", message: `Using ${value}.` });
              }}
              data={[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" },
                { label: "System", value: "auto" },
              ]}
            />
          </div>
          <Button variant="light" color="red" onClick={ctx.clearRecent}>
            Clear recent commands
          </Button>
        </Stack>
      </Modal>

      <Modal opened={shortcutsOpened} onClose={shortcuts.close} title="Keyboard shortcuts">
        <Table verticalSpacing="xs">
          <Table.Tbody>
            {shortcutRows.map((row) => (
              <Table.Tr key={row.label + row.shortcut}>
                <Table.Td>{row.label}</Table.Td>
                <Table.Td>
                  <Group justify="flex-end">
                    <ShortcutKbd shortcut={row.shortcut} />
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Modal>
    </Stack>
  );
}
