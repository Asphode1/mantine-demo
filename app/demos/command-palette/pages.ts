import type { FakePageId } from "./types";

export const fakePages: Record<FakePageId, { title: string; body: string }> = {
  dashboard: {
    title: "Dashboard",
    body: "Overview of activity across all projects.",
  },
  projects: {
    title: "Projects",
    body: "Every project you own or collaborate on.",
  },
  inbox: {
    title: "Inbox",
    body: "Mentions, assignments and review requests.",
  },
  billing: {
    title: "Billing",
    body: "Plan, invoices and payment methods.",
  },
  team: {
    title: "Team",
    body: "Members, roles and pending invitations.",
  },
};
