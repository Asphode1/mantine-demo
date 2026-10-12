export type CommandGroup = "Navigation" | "Actions" | "Settings";

/** Palette "pages": the root list, or a nested list opened by a command. */
export type PaletteView = "root" | "theme";

export type Command = {
  id: string;
  label: string;
  description?: string;
  group: CommandGroup;
  keywords?: string[];
  /** Hotkey in `useHotkeys` syntax, matched by physical key, e.g. 'alt+shift+D'. */
  shortcut?: string;
  icon?: React.ReactNode;
  /** Opens a nested palette view instead of running and closing. */
  opensView?: PaletteView;
  run: () => void;
};

export type FakePageId = "dashboard" | "projects" | "inbox" | "billing" | "team";

/** Everything the command registry needs from the surrounding app. */
export type CommandContext = {
  goTo: (page: FakePageId) => void;
  setColorScheme: (scheme: "light" | "dark" | "auto") => void;
  toggleColorScheme: () => void;
  copyLink: () => void;
  openSettings: () => void;
  openShortcuts: () => void;
  clearRecent: () => void;
};
