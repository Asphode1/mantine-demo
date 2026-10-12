import dayjs from "dayjs";

export type Service = { value: string; label: string; minutes: number; price: number };

export const services: Service[] = [
  { value: "intro", label: "Intro call", minutes: 30, price: 0 },
  { value: "consult", label: "Consultation", minutes: 60, price: 90 },
  { value: "workshop", label: "Workshop", minutes: 90, price: 180 },
];

export type Booking = {
  id: string;
  service: Service;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  name: string;
  notes: string;
};

export const BOOKING_WINDOW_DAYS = 45;

/** 09:00 – 17:00 every 30 minutes. */
export const allSlots = Array.from({ length: 17 }, (_, i) => {
  const minutes = 9 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
});

/** Cheap deterministic hash so availability is stable for a given date. */
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const isWeekend = (date: string) => [0, 6].includes(dayjs(date).day());

/** Weekends plus roughly one weekday in seven are unavailable. */
export function isDateExcluded(date: string): boolean {
  return isWeekend(date) || hash(date) % 7 === 0;
}

/** Slots already taken by other (fake) customers on a date. */
export function takenSlots(date: string): string[] {
  const seed = hash(date);
  return allSlots.filter((_, index) => (seed >> index) % 3 === 0);
}

/** Every slot that cannot be booked: taken, already booked by the user, or in the past. */
export function unavailableSlots(date: string, bookings: Booking[], now = dayjs()): string[] {
  const own = bookings.filter((b) => b.date === date).map((b) => b.time);
  const past = dayjs(date).isSame(now, "day")
    ? allSlots.filter((slot) => slot <= now.format("HH:mm"))
    : [];
  return [...new Set([...takenSlots(date), ...own, ...past])];
}

export const formatDate = (date: string) => dayjs(date).format("dddd, MMMM D");

export function formatRange(date: string, time: string, minutes: number) {
  const start = dayjs(`${date} ${time}`);
  return `${start.format("h:mm A")} – ${start.add(minutes, "minute").format("h:mm A")}`;
}
