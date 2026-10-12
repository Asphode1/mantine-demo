import type { Command, CommandGroup } from "./types";

const groupOrder: CommandGroup[] = ["Navigation", "Actions", "Settings"];

/**
 * Scores a command against a query. Label matches outrank description matches,
 * which outrank keyword matches. Returns 0 when nothing matches.
 */
export function scoreCommand(command: Command, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;

  const label = command.label.toLowerCase();
  if (label.startsWith(q)) return 100;
  if (label.split(/\s+/).some((word) => word.startsWith(q))) return 80;
  if (label.includes(q)) return 60;
  if (command.description?.toLowerCase().includes(q)) return 40;
  if (command.keywords?.some((k) => k.toLowerCase().includes(q))) return 20;
  return 0;
}

export type CommandSection = { group: CommandGroup; commands: Command[] };

/** Filters, ranks within each group, and orders groups by their best match. */
export function searchCommands(commands: Command[], query: string): CommandSection[] {
  const scored = commands
    .map((command) => ({ command, score: scoreCommand(command, query) }))
    .filter((entry) => entry.score > 0);

  const sections = groupOrder
    .map((group) => {
      const entries = scored
        .filter((entry) => entry.command.group === group)
        .sort((a, b) => b.score - a.score);
      return {
        group,
        best: entries[0]?.score ?? 0,
        commands: entries.map((entry) => entry.command),
      };
    })
    .filter((section) => section.commands.length > 0);

  // Stable sort keeps the default group order when scores tie (e.g. empty query).
  return sections
    .sort((a, b) => b.best - a.best)
    .map(({ group, commands }) => ({ group, commands }));
}
