import {
  ActionIcon,
  Affix,
  Badge,
  Button,
  Center,
  Checkbox,
  CloseButton,
  Collapse,
  Group,
  Loader,
  Menu,
  Pagination,
  Paper,
  Popover,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Transition,
} from "@mantine/core";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconChevronRight,
  IconColumns3,
  IconDots,
  IconPencil,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { Fragment, useEffect, useMemo, useState } from "react";

import { columns, currency, dateFormat, type Column } from "./columns";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { EditRowModal } from "./EditRowModal";
import { generateRows, statusColors, statuses } from "./mock";
import { filterRows, nextSort, paginate, rangeLabel, sortRows } from "./pipeline";
import { SortableTh } from "./SortableTh";
import type { Row, SortState, Status, StatusFilter } from "./types";

const capitalize = (value: string) => value[0].toUpperCase() + value.slice(1);

export function DataTableDemo() {
  const [rows, setRows] = useState<Row[]>(() => generateRows());

  // Raw view state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortState>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  // Row action state
  const [editing, setEditing] = useState<Row | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row[]>([]);

  // Persisted presentation preferences
  const [hiddenColumns, setHiddenColumns] = useLocalStorage<string[]>({
    key: "data-table:hidden-columns",
    defaultValue: [],
  });
  const [density, setDensity] = useLocalStorage<"compact" | "comfortable">({
    key: "data-table:density",
    defaultValue: "comfortable",
  });

  const [debouncedSearch] = useDebouncedValue(search, 250);

  useEffect(() => setPage(1), [debouncedSearch]);

  // Derived pipeline: filter → sort → paginate.
  const filtered = useMemo(
    () => filterRows(rows, debouncedSearch, status),
    [rows, debouncedSearch, status],
  );
  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  // Clamp so deleting the last rows of the final page never strands the view.
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(
    () => paginate(sorted, currentPage, pageSize),
    [sorted, currentPage, pageSize],
  );

  const visibleColumns = columns.filter((column) => !hiddenColumns.includes(column.key));
  const colSpan = visibleColumns.length + 3; // checkbox + expand + actions

  // Header checkbox reflects the current page only.
  const selectedOnPage = pageRows.filter((row) => selected.has(row.id)).length;
  const allOnPageSelected = pageRows.length > 0 && selectedOnPage === pageRows.length;
  const someOnPageSelected = selectedOnPage > 0 && !allOnPageSelected;

  const togglePage = () =>
    setSelected((current) => {
      const next = new Set(current);
      pageRows.forEach((row) => (allOnPageSelected ? next.delete(row.id) : next.add(row.id)));
      return next;
    });

  const toggleRow = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleExpanded = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
    notifications.show({ title: "Filters cleared", message: "Showing all users." });
  };

  const changeStatusOfSelected = (nextStatus: Status) => {
    const count = selected.size;
    setRows((current) =>
      current.map((row) => (selected.has(row.id) ? { ...row, status: nextStatus } : row)),
    );
    setSelected(new Set());
    notifications.show({
      color: statusColors[nextStatus],
      title: "Status updated",
      message: `${count} ${count === 1 ? "user" : "users"} marked as ${nextStatus}.`,
    });
  };

  const confirmDelete = () => {
    const ids = new Set(pendingDelete.map((row) => row.id));
    const label =
      pendingDelete.length === 1 ? pendingDelete[0].name : `${pendingDelete.length} users`;
    setRows((current) => current.filter((row) => !ids.has(row.id)));
    setSelected((current) => new Set([...current].filter((id) => !ids.has(id))));
    setPendingDelete([]);
    notifications.show({ color: "red", title: "Deleted", message: `${label} removed.` });
  };

  const saveRow = (updated: Row) => {
    setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setEditing(null);
    notifications.show({
      color: "teal",
      title: "Saved",
      message: `${updated.name} was updated.`,
    });
  };

  const renderCell = (row: Row, column: Column) => {
    switch (column.key) {
      case "name":
        return <Text size="sm" fw={500}>{row.name}</Text>;
      case "status":
        return (
          <Badge variant="light" color={statusColors[row.status]}>
            {row.status}
          </Badge>
        );
      case "createdAt":
        return dateFormat.format(row.createdAt);
      case "amount":
        return currency.format(row.amount);
      default:
        return row[column.key];
    }
  };

  return (
    // Bottom padding keeps the floating bulk-action bar from covering pagination.
    <Stack pb={80}>
      {/* Toolbar */}
      <Group justify="space-between" align="flex-end">
        <Group align="flex-end">
          <TextInput
            placeholder="Search name or email"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            rightSection={
              search !== debouncedSearch ? (
                <Loader size={14} />
              ) : search ? (
                <CloseButton size="sm" aria-label="Clear search" onClick={() => setSearch("")} />
              ) : null
            }
            w={260}
          />
          <SegmentedControl
            value={status}
            onChange={(value) => {
              setStatus(value as StatusFilter);
              setPage(1);
            }}
            data={[
              { label: "All", value: "all" },
              ...statuses.map((s) => ({ label: capitalize(s), value: s })),
            ]}
          />
        </Group>
        <Group gap="xs">
          <SegmentedControl
            size="xs"
            value={density}
            onChange={(value) => setDensity(value as typeof density)}
            data={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <Popover position="bottom-end" shadow="md">
            <Popover.Target>
              <ActionIcon variant="default" size="lg" aria-label="Toggle columns">
                <IconColumns3 size={18} />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="xs" fw={600} c="dimmed" mb="xs">
                Visible columns
              </Text>
              <Stack gap="xs">
                {columns.map((column) => (
                  <Checkbox
                    key={column.key}
                    size="xs"
                    label={column.label}
                    checked={!hiddenColumns.includes(column.key)}
                    disabled={column.locked}
                    onChange={(event) => {
                      const visible = event.currentTarget.checked;
                      setHiddenColumns((current) =>
                        visible
                          ? current.filter((key) => key !== column.key)
                          : [...current, column.key],
                      );
                    }}
                  />
                ))}
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>

      <Table.ScrollContainer minWidth={900} maxHeight={560}>
        <Table
          stickyHeader
          highlightOnHover
          verticalSpacing={density === "compact" ? 4 : "sm"}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={40}>
                <Checkbox
                  aria-label="Select all rows on this page"
                  checked={allOnPageSelected}
                  indeterminate={someOnPageSelected}
                  onChange={togglePage}
                  disabled={pageRows.length === 0}
                />
              </Table.Th>
              <Table.Th w={40} />
              {visibleColumns.map((column) => (
                <SortableTh
                  key={column.key}
                  column={column}
                  sort={sort}
                  onSort={() => setSort((current) => nextSort(current, column.key))}
                />
              ))}
              <Table.Th w={48} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pageRows.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={colSpan}>
                  <Center py="xl">
                    <Stack align="center" gap="xs">
                      <Text fw={500}>No results</Text>
                      <Text size="sm" c="dimmed">
                        Nothing matches the current search and filter.
                      </Text>
                      <Button variant="light" size="xs" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    </Stack>
                  </Center>
                </Table.Td>
              </Table.Tr>
            )}
            {pageRows.map((row) => {
              const isSelected = selected.has(row.id);
              const isExpanded = expanded.has(row.id);
              return (
                <Fragment key={row.id}>
                  <Table.Tr bg={isSelected ? "var(--mantine-primary-color-light)" : undefined}>
                    <Table.Td>
                      <Checkbox
                        aria-label={`Select ${row.name}`}
                        checked={isSelected}
                        onChange={() => toggleRow(row.id)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        aria-label={isExpanded ? "Hide details" : "Show details"}
                        aria-expanded={isExpanded}
                        onClick={() => toggleExpanded(row.id)}
                      >
                        <IconChevronRight
                          size={16}
                          style={{
                            transform: isExpanded ? "rotate(90deg)" : undefined,
                            transition: "transform 150ms ease",
                          }}
                        />
                      </ActionIcon>
                    </Table.Td>
                    {visibleColumns.map((column) => (
                      <Table.Td key={column.key} ta={column.align ?? "left"}>
                        {renderCell(row, column)}
                      </Table.Td>
                    ))}
                    <Table.Td>
                      <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray" aria-label="Row actions">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconPencil size={14} />}
                            onClick={() => setEditing(row)}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => setPendingDelete([row])}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr style={isExpanded ? undefined : { borderBottom: "none" }}>
                    <Table.Td colSpan={colSpan} p={0}>
                      <Collapse expanded={isExpanded}>
                        <SimpleGrid cols={{ base: 2, sm: 4 }} px="xl" py="sm">
                          <Detail label="User ID" value={row.id} />
                          <Detail label="Email" value={row.email} />
                          <Detail
                            label="Member since"
                            value={dateFormat.format(row.createdAt)}
                          />
                          <Detail label="Lifetime spend" value={currency.format(row.amount)} />
                        </SimpleGrid>
                      </Collapse>
                    </Table.Td>
                  </Table.Tr>
                </Fragment>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* Footer: range label, page size, pagination */}
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {rangeLabel(currentPage, pageSize, sorted.length)}
        </Text>
        <Group>
          <Group gap="xs">
            <Text size="sm">Rows per page</Text>
            <Select
              w={80}
              size="xs"
              allowDeselect={false}
              value={String(pageSize)}
              onChange={(value) => {
                setPageSize(Number(value));
                setPage(1);
              }}
              data={["10", "25", "50"]}
            />
          </Group>
          <Pagination total={totalPages} value={currentPage} onChange={setPage} size="sm" />
        </Group>
      </Group>

      {/* Bulk-action bar */}
      <Affix position={{ bottom: 24, left: 0, right: 0 }} style={{ pointerEvents: "none" }}>
        <Transition mounted={selected.size > 0} transition="slide-up" duration={200}>
          {(styles) => (
            <Center style={styles}>
              <Paper shadow="lg" withBorder p="sm" px="md" style={{ pointerEvents: "auto" }}>
                <Group>
                  <Text size="sm" fw={500}>
                    {selected.size} selected
                  </Text>
                  <Menu position="top">
                    <Menu.Target>
                      <Button size="xs" variant="default">
                        Change status
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {statuses.map((s) => (
                        <Menu.Item key={s} onClick={() => changeStatusOfSelected(s)}>
                          <Badge variant="light" color={statusColors[s]}>
                            {s}
                          </Badge>
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => setPendingDelete(rows.filter((row) => selected.has(row.id)))}
                  >
                    Delete
                  </Button>
                  <CloseButton
                    size="sm"
                    aria-label="Clear selection"
                    onClick={() => {
                      setSelected(new Set());
                      notifications.show({ title: "Selection cleared", message: "No rows selected." });
                    }}
                  />
                </Group>
              </Paper>
            </Center>
          )}
        </Transition>
      </Affix>

      <EditRowModal row={editing} onClose={() => setEditing(null)} onSave={saveRow} />
      <ConfirmDeleteModal
        names={pendingDelete.map((row) => row.name)}
        onCancel={() => setPendingDelete([])}
        onConfirm={confirmDelete}
      />
    </Stack>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm">{value}</Text>
    </div>
  );
}
