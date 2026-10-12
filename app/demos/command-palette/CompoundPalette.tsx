import { Badge, Group, Highlight, Stack, Text } from "@mantine/core";
import { Spotlight } from "@mantine/spotlight";
import { IconChevronRight, IconSearch } from "@tabler/icons-react";

import { ShortcutKbd } from "~/components/ShortcutKbd";

import { viewTitles } from "./commands";
import { searchCommands } from "./search";
import type { Command, PaletteView } from "./types";

// Spotlight sets these on the selected action so secondary text stays legible on the filled background.
const dimmedStyle = {
  color: "var(--action-description-color, var(--mantine-color-dimmed))",
  opacity: "var(--action-description-opacity, 1)",
};

type CompoundPaletteProps = {
  commands: Command[];
  viewCommands: Record<Exclude<PaletteView, "root">, Command[]>;
  recent: Command[];
  view: PaletteView;
  onViewChange: (view: PaletteView) => void;
  query: string;
  onQueryChange: (query: string) => void;
  execute: (command: Command) => void;
};

export function CompoundPalette({
  commands,
  viewCommands,
  recent,
  view,
  onViewChange,
  query,
  onQueryChange,
  execute,
}: CompoundPaletteProps) {
  const source = view === "root" ? commands : viewCommands[view];
  const sections = searchCommands(source, query);
  const showRecent = view === "root" && query.trim() === "" && recent.length > 0;

  const renderAction = (command: Command, keyPrefix = "") => (
    <Spotlight.Action
      key={keyPrefix + command.id}
      onClick={() => execute(command)}
      closeSpotlightOnTrigger={!command.opensView}
    >
      <Group wrap="nowrap" w="100%" gap="sm">
        <Text display="flex" style={dimmedStyle}>
          {command.icon}
        </Text>
        <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
          <Highlight highlight={query} size="sm">
            {command.label}
          </Highlight>
          {command.description && (
            <Highlight highlight={query} size="xs" truncate style={dimmedStyle}>
              {command.description}
            </Highlight>
          )}
        </Stack>
        {command.shortcut && <ShortcutKbd shortcut={command.shortcut} />}
        {command.opensView && <IconChevronRight size={16} opacity={0.6} />}
      </Group>
    </Spotlight.Action>
  );

  return (
    <Spotlight.Root
      query={query}
      onQueryChange={onQueryChange}
      shortcut={["mod + K", "/"]}
      scrollable
      maxHeight={440}
      onSpotlightClose={() => onViewChange("root")}
    >
      <Spotlight.Search
        placeholder={view === "root" ? "Type a command or search…" : "Filter options…"}
        leftSection={
          view === "root" ? (
            <IconSearch size={18} stroke={1.5} />
          ) : (
            <Badge size="sm" variant="light">
              {viewTitles[view]}
            </Badge>
          )
        }
        leftSectionWidth={view === "root" ? undefined : 80}
        onKeyDown={(event) => {
          // Backspace on an empty query steps back out of a nested view.
          if (event.key === "Backspace" && query === "" && view !== "root") {
            event.preventDefault();
            onViewChange("root");
          }
        }}
      />
      <Spotlight.ActionsList>
        {showRecent && (
          <Spotlight.ActionsGroup label="Recent">
            {recent.map((command) => renderAction(command, "recent-"))}
          </Spotlight.ActionsGroup>
        )}
        {sections.map((section) => (
          <Spotlight.ActionsGroup key={section.group} label={section.group}>
            {section.commands.map((command) => renderAction(command))}
          </Spotlight.ActionsGroup>
        ))}
        {sections.length === 0 && (
          <Spotlight.Empty>
            No commands match “{query}”. Try “theme”, “copy” or “inbox”.
          </Spotlight.Empty>
        )}
      </Spotlight.ActionsList>
      <Spotlight.Footer>
        <Group gap="md" justify="center">
          <FooterHint keys={["↑", "↓"]} label="navigate" />
          <FooterHint keys={["↵"]} label="run" />
          <FooterHint keys={["esc"]} label="close" />
          {view !== "root" && <FooterHint keys={["⌫"]} label="back" />}
        </Group>
      </Spotlight.Footer>
    </Spotlight.Root>
  );
}

function FooterHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <Text size="xs" c="dimmed">
      {keys.join(" ")} {label}
    </Text>
  );
}
