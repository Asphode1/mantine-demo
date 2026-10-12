import { notifications } from "@mantine/notifications";
import {
  IconBell,
  IconCreditCard,
  IconDashboard,
  IconDeviceDesktop,
  IconFolder,
  IconHistory,
  IconInbox,
  IconKeyboard,
  IconLink,
  IconMoon,
  IconPalette,
  IconPlus,
  IconRefresh,
  IconSettings,
  IconSun,
  IconUsers,
} from "@tabler/icons-react";

import { fakePages } from "./pages";
import type { Command, CommandContext, FakePageId, PaletteView } from "./types";

const iconProps = { size: 18, stroke: 1.5 };

const navigationIcons: Record<FakePageId, React.ReactNode> = {
  dashboard: <IconDashboard {...iconProps} />,
  projects: <IconFolder {...iconProps} />,
  inbox: <IconInbox {...iconProps} />,
  billing: <IconCreditCard {...iconProps} />,
  team: <IconUsers {...iconProps} />,
};

const navigationMeta: Record<FakePageId, { shortcut?: string; keywords: string[] }> = {
  dashboard: { shortcut: "alt+shift+D", keywords: ["home", "overview", "start"] },
  projects: { shortcut: "alt+shift+P", keywords: ["repos", "workspaces"] },
  inbox: { shortcut: "alt+shift+I", keywords: ["mentions", "messages", "notifications"] },
  billing: { keywords: ["invoice", "payment", "plan", "subscription"] },
  team: { keywords: ["members", "people", "invite", "users"] },
};

/** Builds the root command registry. Pure data plus closures over `ctx`. */
export function buildCommands(ctx: CommandContext): Command[] {
  const navigation: Command[] = (Object.keys(fakePages) as FakePageId[]).map((page) => ({
    id: `go-${page}`,
    label: `Go to ${fakePages[page].title}`,
    description: fakePages[page].body,
    group: "Navigation",
    icon: navigationIcons[page],
    ...navigationMeta[page],
    run: () => ctx.goTo(page),
  }));

  const actions: Command[] = [
    {
      id: "copy-link",
      label: "Copy link",
      description: "Copy the current page URL to the clipboard",
      group: "Actions",
      keywords: ["url", "share", "clipboard"],
      shortcut: "alt+shift+C",
      icon: <IconLink {...iconProps} />,
      run: ctx.copyLink,
    },
    {
      id: "test-notification",
      label: "Show test notification",
      description: "Trigger a sample toast",
      group: "Actions",
      keywords: ["toast", "alert", "ping"],
      shortcut: "alt+shift+N",
      icon: <IconBell {...iconProps} />,
      run: () =>
        notifications.show({
          title: "Hello from the palette",
          message: "This is what a test notification looks like.",
        }),
    },
    {
      id: "new-project",
      label: "Create project",
      description: "Start a new empty project",
      group: "Actions",
      keywords: ["add", "new", "repo"],
      icon: <IconPlus {...iconProps} />,
      run: () =>
        notifications.show({
          color: "teal",
          title: "Project created",
          message: "“Untitled project” was added to Projects.",
        }),
    },
    {
      id: "sync",
      label: "Sync data",
      description: "Refresh everything from the server",
      group: "Actions",
      keywords: ["refresh", "reload", "fetch"],
      icon: <IconRefresh {...iconProps} />,
      run: () => {
        const id = notifications.show({
          loading: true,
          title: "Syncing…",
          message: "Fetching the latest data",
          autoClose: false,
          withCloseButton: false,
        });
        setTimeout(() => {
          notifications.update({
            id,
            loading: false,
            color: "teal",
            title: "Sync complete",
            message: "Everything is up to date.",
            autoClose: 2500,
            withCloseButton: true,
          });
        }, 1200);
      },
    },
  ];

  const settings: Command[] = [
    {
      id: "toggle-theme",
      label: "Toggle color scheme",
      description: "Switch between light and dark",
      group: "Settings",
      keywords: ["dark mode", "light mode", "appearance"],
      shortcut: "alt+shift+L",
      icon: <IconMoon {...iconProps} />,
      run: ctx.toggleColorScheme,
    },
    {
      id: "change-theme",
      label: "Change theme…",
      description: "Pick light, dark or system",
      group: "Settings",
      keywords: ["appearance", "color scheme"],
      icon: <IconPalette {...iconProps} />,
      opensView: "theme",
      run: () => {},
    },
    {
      id: "open-settings",
      label: "Open settings",
      description: "Preferences for this workspace",
      group: "Settings",
      keywords: ["preferences", "options", "config"],
      shortcut: "alt+shift+S",
      icon: <IconSettings {...iconProps} />,
      run: ctx.openSettings,
    },
    {
      id: "show-shortcuts",
      label: "Keyboard shortcuts",
      description: "List every shortcut",
      group: "Settings",
      keywords: ["hotkeys", "keys", "help"],
      shortcut: "alt+shift+K",
      icon: <IconKeyboard {...iconProps} />,
      run: ctx.openShortcuts,
    },
    {
      id: "clear-recent",
      label: "Clear recent commands",
      description: "Forget the Recent group",
      group: "Settings",
      keywords: ["history", "reset"],
      icon: <IconHistory {...iconProps} />,
      run: ctx.clearRecent,
    },
  ];

  return [...navigation, ...actions, ...settings];
}

/** Commands shown in nested palette views. */
export function buildViewCommands(
  ctx: CommandContext,
): Record<Exclude<PaletteView, "root">, Command[]> {
  const setScheme = (scheme: "light" | "dark" | "auto", label: string) => () => {
    ctx.setColorScheme(scheme);
    notifications.show({ title: "Theme changed", message: `Using ${label} theme.` });
  };

  return {
    theme: [
      {
        id: "theme-light",
        label: "Light theme",
        group: "Settings",
        icon: <IconSun {...iconProps} />,
        run: setScheme("light", "light"),
      },
      {
        id: "theme-dark",
        label: "Dark theme",
        group: "Settings",
        icon: <IconMoon {...iconProps} />,
        run: setScheme("dark", "dark"),
      },
      {
        id: "theme-auto",
        label: "System theme",
        description: "Follow the operating system",
        group: "Settings",
        keywords: ["auto", "os"],
        icon: <IconDeviceDesktop {...iconProps} />,
        run: setScheme("auto", "system"),
      },
    ],
  };
}

export const viewTitles: Record<PaletteView, string> = {
  root: "",
  theme: "Theme",
};
