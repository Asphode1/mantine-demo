export type Status = "active" | "invited" | "suspended";

export type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: Status;
  createdAt: Date;
  amount: number;
};

export type SortKey = Exclude<keyof Row, "id">;
export type SortDirection = "asc" | "desc";
export type SortState = { key: SortKey; direction: SortDirection } | null;

export type StatusFilter = Status | "all";
