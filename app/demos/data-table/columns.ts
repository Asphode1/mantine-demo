import type { SortKey } from "./types";

export type Column = {
  key: SortKey;
  label: string;
  align?: "left" | "right";
  /** Columns that cannot be hidden from the visibility menu. */
  locked?: boolean;
};

export const columns: Column[] = [
  { key: "name", label: "Name", locked: true },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created" },
  { key: "amount", label: "Amount", align: "right" },
];

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const dateFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});
