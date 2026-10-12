import { Spotlight, type SpotlightActionGroupData } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";

import { ShortcutKbd } from "~/components/ShortcutKbd";

import type { Command } from "./types";

type SimplePaletteProps = {
  commands: Command[];
  execute: (command: Command) => void;
};

/** Step 2 of the spec: the registry mapped straight into `<Spotlight actions>`. */
export function SimplePalette({ commands, execute }: SimplePaletteProps) {
  const groups = ["Navigation", "Actions", "Settings"] as const;

  const actions: SpotlightActionGroupData[] = groups.map((group) => ({
    group,
    actions: commands
      // Nested views need the compound API; simple mode only runs flat commands.
      .filter((command) => command.group === group && !command.opensView)
      .map((command) => ({
        id: command.id,
        label: command.label,
        description: command.description,
        keywords: command.keywords,
        leftSection: command.icon,
        rightSection: command.shortcut ? (
          <ShortcutKbd shortcut={command.shortcut} />
        ) : undefined,
        onClick: () => execute(command),
      })),
  }));

  return (
    <Spotlight
      actions={actions}
      highlightQuery
      nothingFound="Nothing found…"
      limit={8}
      scrollable
      maxHeight={440}
      shortcut={["mod + K", "/"]}
      searchProps={{
        leftSection: <IconSearch size={18} stroke={1.5} />,
        placeholder: "Search commands…",
      }}
    />
  );
}
