export type Author = "me" | "bot";

export type Message = {
  id: string;
  author: Author;
  text: string;
  sentAt: number;
};

export const participants: Record<Author, { name: string; initials: string; color: string }> = {
  me: { name: "You", initials: "ME", color: "indigo" },
  bot: { name: "Mantine bot", initials: "MB", color: "teal" },
};

let sequence = 0;

export function createMessage(author: Author, text: string, sentAt = Date.now()): Message {
  sequence += 1;
  return { id: `m-${sequence}`, author, text, sentAt };
}

export function initialMessages(): Message[] {
  const start = Date.now() - 1000 * 60 * 12;
  return [
    createMessage("bot", "Hi! I'm a scripted bot. Ask me about components, hooks or theming.", start),
    createMessage("me", "Which hook handles keyboard shortcuts?", start + 60_000),
    createMessage(
      "bot",
      "That's useHotkeys for the document, or getHotkeyHandler for a single element — this input uses the latter so Enter sends and Shift+Enter adds a new line.",
      start + 75_000,
    ),
  ];
}

const rules: Array<{ match: RegExp; reply: string }> = [
  { match: /\b(hi|hello|hey)\b/i, reply: "Hello! What would you like to build today?" },
  { match: /scroll/i, reply: "This list auto-scrolls with useScrollIntoView, unless you've scrolled up to read history." },
  { match: /theme|color|dark/i, reply: "Theming goes through createTheme and MantineProvider; color scheme via useMantineColorScheme." },
  { match: /form|valid/i, reply: "@mantine/form's useForm handles values, validation and touched/dirty state." },
  { match: /date|calendar/i, reply: "@mantine/dates has DatePicker, TimeGrid and friends — see the booking demo." },
  { match: /chart|graph/i, reply: "@mantine/charts wraps recharts: AreaChart, BarChart, DonutChart and more." },
  { match: /thank/i, reply: "Anytime! 🙌" },
];

const fallbacks = [
  "Interesting — tell me more.",
  "I'm only a demo bot, but that sounds like a job for a Mantine component.",
  "Good question. Have you tried the command palette demo? Press ⌘K there.",
];

export function botReply(input: string): string {
  const rule = rules.find((r) => r.match.test(input));
  return rule ? rule.reply : fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/** Typing delay roughly proportional to reply length. */
export const typingDelay = (reply: string) => Math.min(2500, 600 + reply.length * 20);

export const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
