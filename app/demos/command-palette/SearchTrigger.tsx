import { UnstyledButton } from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons-react";

import { ShortcutKbd } from "~/components/ShortcutKbd";

import classes from "./SearchTrigger.module.css";

/** Fake search input in the header; `ShortcutKbd` shows ⌘K on Apple OSes and Ctrl K elsewhere. */
export function SearchTrigger() {
  return (
    <UnstyledButton
      className={classes.trigger}
      onClick={() => spotlight.open()}
      aria-label="Open command palette"
    >
      <IconSearch size={16} stroke={1.5} />
      <span className={classes.label}>Search…</span>
      <ShortcutKbd shortcut="mod+K" />
    </UnstyledButton>
  );
}
