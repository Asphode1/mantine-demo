import type { Row, SortState, StatusFilter } from "./types";

export function filterRows(rows: Row[], search: string, status: StatusFilter): Row[] {
  const q = search.trim().toLowerCase();
  return rows.filter(
    (row) =>
      (status === "all" || row.status === status) &&
      (!q || row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q)),
  );
}

/** One comparator for every column kind: dates, numbers and strings. */
export function compareValues(a: unknown, b: unknown): number {
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

export function sortRows(rows: Row[], sort: SortState): Row[] {
  if (!sort) return rows;
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => factor * compareValues(a[sort.key], b[sort.key]));
}

/** asc → desc → unsorted, or asc when switching to another column. */
export function nextSort(current: SortState, key: NonNullable<SortState>["key"]): SortState {
  if (!current || current.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return null;
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function rangeLabel(page: number, pageSize: number, total: number): string {
  if (total === 0) return "Showing 0 of 0";
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return `Showing ${from}–${to} of ${total}`;
}
