export type InboxKind = "mention" | "comment" | "assign" | "deploy" | "invite";

export type InboxItem = {
  id: string;
  kind: InboxKind;
  actor: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
};

export const kindColors: Record<InboxKind, string> = {
  mention: "indigo",
  comment: "blue",
  assign: "orange",
  deploy: "teal",
  invite: "grape",
};

const templates: Array<Omit<InboxItem, "id" | "createdAt" | "read">> = [
  { kind: "mention", actor: "Ada Lovelace", title: "mentioned you", body: "“@you can you review the engine notes?”" },
  { kind: "comment", actor: "Alan Turing", title: "commented on Q3 roadmap", body: "Looks good — one question about scope." },
  { kind: "assign", actor: "Grace Hopper", title: "assigned you an issue", body: "#482 Compiler crashes on empty input" },
  { kind: "deploy", actor: "CI", title: "deployed to production", body: "web@4.12.0 is live in all regions." },
  { kind: "invite", actor: "Linus Torvalds", title: "invited you to a project", body: "Join “Kernel docs” as an editor." },
  { kind: "comment", actor: "Margaret Hamilton", title: "replied to your comment", body: "Agreed, let's ship it Friday." },
  { kind: "mention", actor: "Barbara Liskov", title: "mentioned you in Design review", body: "“@you owns the substitution section.”" },
  { kind: "deploy", actor: "CI", title: "preview deployment ready", body: "feat/inbox → preview-1293.example.dev" },
];

let sequence = 0;

export function makeItem(template = templates[sequence % templates.length], ageMinutes = 0, read = false): InboxItem {
  sequence += 1;
  return {
    ...template,
    id: `n-${sequence}`,
    createdAt: Date.now() - ageMinutes * 60_000,
    read,
  };
}

export function initialInbox(): InboxItem[] {
  const ages = [2, 14, 38, 95, 180, 420, 1500, 3000];
  return templates.map((template, index) => makeItem(template, ages[index], index >= 4));
}

/** Picks a random template for the "simulate incoming" button. */
export function randomItem(): InboxItem {
  return makeItem(templates[Math.floor(Math.random() * templates.length)]);
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function timeAgo(timestamp: number, now = Date.now()): string {
  const minutes = Math.round((timestamp - now) / 60_000);
  if (Math.abs(minutes) < 1) return "just now";
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

export const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
