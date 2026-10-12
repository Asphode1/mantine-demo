import { Group, Table, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconSelector } from "@tabler/icons-react";

import type { Column } from "./columns";
import type { SortState } from "./types";

type SortableThProps = {
  column: Column;
  sort: SortState;
  onSort: () => void;
};

export function SortableTh({ column, sort, onSort }: SortableThProps) {
  const active = sort?.key === column.key;
  const Icon = !active ? IconSelector : sort.direction === "asc" ? IconChevronUp : IconChevronDown;
  const ariaSort = !active ? "none" : sort.direction === "asc" ? "ascending" : "descending";

  return (
    <Table.Th aria-sort={ariaSort} style={{ whiteSpace: "nowrap" }}>
      <UnstyledButton onClick={onSort} w="100%">
        <Group
          gap={4}
          wrap="nowrap"
          justify={column.align === "right" ? "flex-end" : "flex-start"}
        >
          <Text fw={600} size="sm">
            {column.label}
          </Text>
          <Icon size={14} stroke={1.5} opacity={active ? 1 : 0.5} />
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}
