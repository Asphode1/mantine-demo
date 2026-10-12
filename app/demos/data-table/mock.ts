import type { Row, Status } from "./types";

export const roles = ["Admin", "Developer", "Designer", "Billing", "Support", "Viewer"];
export const statuses: Status[] = ["active", "invited", "suspended"];

export const statusColors: Record<Status, string> = {
  active: "teal",
  invited: "blue",
  suspended: "red",
};

const firstNames = [
  "Ada", "Alan", "Grace", "Linus", "Margaret", "Ken", "Barbara", "Dennis",
  "Frances", "Tim", "Radia", "Guido", "Hedy", "Bjarne", "Katherine", "John",
  "Sophie", "Yukihiro", "Anita", "James",
];

const lastNames = [
  "Lovelace", "Turing", "Hopper", "Torvalds", "Hamilton", "Thompson", "Liskov",
  "Ritchie", "Allen", "Berners-Lee", "Perlman", "van Rossum", "Lamarr",
  "Stroustrup", "Johnson", "McCarthy", "Wilson", "Matsumoto", "Borg", "Gosling",
];

/** Small deterministic PRNG so the table looks the same on every reload. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRows(count = 87, seed = 42): Row[] {
  const random = mulberry32(seed);
  const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];
  const now = Date.now();
  const twoYears = 1000 * 60 * 60 * 24 * 730;

  return Array.from({ length: count }, (_, index) => {
    const first = pick(firstNames);
    const last = pick(lastNames);
    const handle = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "");

    return {
      id: `usr_${(index + 1).toString().padStart(3, "0")}`,
      name: `${first} ${last}`,
      email: `${handle}${index}@example.com`,
      role: pick(roles),
      status: pick(statuses),
      createdAt: new Date(now - Math.floor(random() * twoYears)),
      amount: Math.round(random() * 500000) / 100,
    };
  });
}
