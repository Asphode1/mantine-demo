export type DemoMeta = {
  slug: string;
  number: number;
  title: string;
  description: string;
  packages: string[];
  /** Renders outside the gallery shell because it provides its own full-page layout. */
  standalone?: boolean;
};

export const demos: DemoMeta[] = [
  {
    slug: "command-palette",
    number: 1,
    title: "Command palette",
    description:
      "⌘K launcher with grouped, filterable commands, recents and direct shortcuts.",
    packages: ["core", "hooks", "spotlight", "notifications"],
  },
  {
    slug: "data-table",
    number: 2,
    title: "Data table",
    description:
      "Debounced search, status filter, sortable headers, pagination, bulk and row actions.",
    packages: ["core", "hooks", "form", "notifications"],
  },
  {
    slug: "onboarding-wizard",
    number: 3,
    title: "Onboarding wizard",
    description: "Multi-step Stepper with per-step form validation.",
    packages: ["core", "hooks", "form", "notifications"],
  },
  {
    slug: "settings",
    number: 4,
    title: "Settings page",
    description: "Vertical tabs of preferences, persisted and applied live.",
    packages: ["core", "hooks", "notifications"],
  },
  {
    slug: "admin-shell",
    number: 5,
    title: "Admin shell",
    description:
      "Responsive AppShell with collapsible navbar, nested links and breadcrumbs.",
    packages: ["core", "hooks", "notifications"],
    standalone: true,
  },
  {
    slug: "file-upload",
    number: 6,
    title: "File upload manager",
    description: "Dropzone with simulated per-file upload progress, remove and retry.",
    packages: ["core", "hooks", "dropzone", "notifications"],
  },
  {
    slug: "notification-inbox",
    number: 7,
    title: "Notification inbox",
    description: "Bell with unread indicator and a tabbed popover inbox.",
    packages: ["core", "hooks", "notifications"],
  },
  {
    slug: "booking",
    number: 8,
    title: "Appointment booking",
    description: "Pick a date and time slot, confirm, and review the booking timeline.",
    packages: ["core", "hooks", "form", "dates", "notifications"],
  },
  {
    slug: "chat",
    number: 9,
    title: "Chat interface",
    description: "Message list with auto-scroll, Enter-to-send and typing indicator.",
    packages: ["core", "hooks"],
  },
  {
    slug: "analytics",
    number: 10,
    title: "Analytics dashboard",
    description: "Stat cards, time-range switcher and area, bar and donut charts.",
    packages: ["core", "hooks", "charts", "notifications"],
  },
  {
    slug: "code-editor",
    number: 11,
    title: "Code editor",
    description:
      "VS Code-style editor with shiki syntax highlighting, line-number gutter, tabs and status bar.",
    packages: ["core", "hooks", "code-highlight", "notifications"],
  },
];

export function getDemo(slug: string): DemoMeta {
  const demo = demos.find((d) => d.slug === slug);
  if (!demo) throw new Error(`Unknown demo: ${slug}`);
  return demo;
}
