import { Box, Kbd, type KbdProps } from "@mantine/core";
import { useOs } from "@mantine/hooks";

const macSymbols: Record<string, string> = {
  mod: "⌘",
  meta: "⌘",
  ctrl: "⌃",
  alt: "⌥",
  shift: "⇧",
};

const pcLabels: Record<string, string> = {
  mod: "Ctrl",
  meta: "Win",
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift",
};

/** Splits a `useHotkeys`-style shortcut ('mod+shift+K') into display labels for the current OS. */
export function useShortcutKeys(shortcut: string): string[] {
  const os = useOs();
  const isApple = os === "macos" || os === "ios";
  const labels = isApple ? macSymbols : pcLabels;

  return shortcut
    .split("+")
    .map((part) => part.trim())
    .map((part) => labels[part.toLowerCase()] ?? part.toUpperCase());
}

export function ShortcutKbd({
  shortcut,
  size = "xs",
}: {
  shortcut: string;
  size?: KbdProps["size"];
}) {
  const keys = useShortcutKeys(shortcut);

  return (
    // Inline so it can sit inside running text as well as in flex rows.
    <Box
      component="span"
      style={{ display: "inline-flex", gap: 4, alignItems: "center", whiteSpace: "nowrap" }}
    >
      {keys.map((key) => (
        <Kbd key={key} size={size}>
          {key}
        </Kbd>
      ))}
    </Box>
  );
}
