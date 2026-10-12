# CLAUDE.md

## Project overview

A collection of "second-tier" UI demos built entirely with Mantine. Each demo is a mid-complexity feature (beyond a single component, short of a full app) that combines several Mantine components and hooks into something that behaves like a real product feature.

The goal is to showcase Mantine's breadth: core components, hooks, forms, and official extension packages.

## Ground rules

- **Mantine only.** Use components and hooks from official `@mantine/*` packages. Do not add third-party UI, state, or form libraries.
- **Allowed exceptions:** `@tabler/icons-react` for icons (used throughout Mantine's own docs), peer dependencies required by official Mantine packages (`dayjs` for `@mantine/dates`, `recharts` for `@mantine/charts`), and React Router (framework mode) for the app shell and routing between demos.
- **Mock data** is generated with small hand-written functions, not faker or similar libraries.
- **Verify APIs against the installed Mantine version.** Some APIs differ between v7 and v8 (e.g. `TimeGrid` exists only in v8). Check the docs at https://mantine.dev when unsure.
- Keep data (registries, mock records, types) separate from UI components.
- Every user-visible action should produce visible feedback (usually `notifications.show()`).

## Setup

Packages used across the demos:

- Core set: `@mantine/core`, `@mantine/hooks`, `@mantine/form`, `@mantine/notifications`
- Extensions (per demo): `@mantine/spotlight`, `@mantine/dropzone`, `@mantine/dates` (+ `dayjs`), `@mantine/charts` (+ `recharts`)

Required in the app root:

- Import `@mantine/core/styles.css`, plus the stylesheet of every extension package used (e.g. `@mantine/spotlight/styles.css`, `@mantine/notifications/styles.css`, `@mantine/dates/styles.css`, `@mantine/dropzone/styles.css`, `@mantine/charts/styles.css`).
- Wrap the app in `MantineProvider`.
- Mount `<Notifications />` inside `MantineProvider`.

Strictly core-only demos (only `@mantine/core` + `@mantine/hooks` + `@mantine/form`): #2, #3, #4, #5, #7, #9. These may still use `@mantine/notifications` for feedback (it is part of the core set above); they must not use the extension packages.

## Project layout and commands

- Stack: React Router 8 framework mode in SPA mode (`ssr: false`), Vite, TypeScript, Mantine 9.
- `npm run dev` · `npm run build` · `npm run typecheck`
- `app/root.tsx`: stylesheets, `MantineProvider`, `Notifications`. `app/theme.ts`: theme.
- `app/routes.ts`: route table. Gallery demos render inside `routes/gallery-layout.tsx`; the admin shell (#5) is a standalone splat route (`admin-shell/*`) because it owns the viewport.
- `app/routes/<slug>.tsx`: thin route modules. `app/demos/registry.ts`: demo metadata.
- `app/demos/<slug>/`: one folder per demo; data, types and pure logic (`*.ts`) are kept apart from components (`*.tsx`).

Mantine 9 API differences hit so far: `Collapse` uses `expanded` (not `in`), `Grid` uses `gap` (not `gutter`), `Title` is not polymorphic, dates are `YYYY-MM-DD` strings.

## Demo list

| # | Demo | Status |
|---|------|--------|
| 1 | Command palette (⌘K launcher) | Implemented (incl. stretch goals) |
| 2 | Searchable, sortable data table | Implemented (incl. stretch goals) |
| 3 | Multi-step onboarding wizard | Implemented from outline |
| 4 | Settings page with live preferences | Implemented from outline |
| 5 | Responsive admin shell | Implemented from outline |
| 6 | File upload manager | Implemented from outline |
| 7 | Notification inbox dropdown | Implemented from outline |
| 8 | Appointment booking widget | Implemented from outline |
| 9 | Chat interface | Implemented from outline |
| 10 | Analytics dashboard | Implemented from outline |

---

## #1 Command palette (⌘K launcher)

### What it is

A searchable launcher that opens with ⌘K / Ctrl+K (or a header button), shows grouped commands (navigation, actions, recent), filters as you type with highlighted matches, and runs the selected command. Each command also has its own direct keyboard shortcut usable outside the palette.

### Packages

`@mantine/core`, `@mantine/hooks`, `@mantine/spotlight`, `@mantine/notifications`

### Components and hooks

- **Spotlight:** `Spotlight` (simple mode), then compound parts `Spotlight.Root`, `Spotlight.Search`, `Spotlight.ActionsList`, `Spotlight.ActionsGroup`, `Spotlight.Action`, `Spotlight.Empty`; the `spotlight` store (`spotlight.open()`, `spotlight.close()`)
- **Core:** `Highlight`, `Kbd`, `Group`, `Text`, `Badge`, `UnstyledButton` (or read-only `TextInput`) for the trigger
- **Hooks:** `useHotkeys`, `useLocalStorage`, `useOs`, `useClipboard`
- **Other:** `useMantineColorScheme` (toggle theme command), `notifications.show()`

### Command type

```ts
type Command = {
  id: string;
  label: string;
  description?: string;
  group: 'Navigation' | 'Actions' | 'Settings';
  keywords?: string[];      // extra search terms
  shortcut?: string;        // e.g. 'mod+J', for useHotkeys
  icon?: React.ReactNode;
  run: () => void;
};
```

Registry should hold 10–15 commands: navigate to fake pages, toggle color scheme, copy current URL, show a test notification, open a settings modal, etc.

### Build steps

1. **Command registry.** Define commands as data, separate from UI.
2. **Simple mode first.** Map the registry into the `actions` prop of `<Spotlight />` (use `{ group, actions: [...] }` for grouping). Set `highlightQuery`, `nothingFound`, `limit`, `scrollable`, `shortcut={['mod + K', '/']}`. Get this working end to end before continuing.
3. **Compound mode.** Replace with `Spotlight.Root` using controlled `query` / `onQueryChange`. Filter manually: match lowercased query against label, description, and keywords. Group filtered results into `Spotlight.ActionsGroup` with `Spotlight.Action` children. Render `Spotlight.Empty` when nothing matches. Use `<Highlight highlight={query}>` for labels and put a `Kbd` shortcut hint in the right section.
4. **Recent commands.** Store command ids via `useLocalStorage`. On run: move id to front, dedupe, cap at 5. Show a "Recent" group only when the query is empty.
5. **Direct shortcuts.** Build a hotkey list from commands with a `shortcut` and pass it to `useHotkeys`. Route both palette and hotkey paths through a single `execute(command)` that runs the command, records it as recent, and closes the palette.
6. **Trigger button.** Header fake search bar: `UnstyledButton` styled like an input, "Search…" text plus `Kbd` hint, calls `spotlight.open()`. Use `useOs` to show ⌘K on macOS and Ctrl+K elsewhere.
7. **Feedback.** "Copy link" uses `useClipboard` and confirms via `notifications.show()`; every command produces something visible.

### Acceptance criteria

- [ ] Opens via keyboard shortcut and header button
- [ ] Filters across label, description, and keywords with highlighted matches
- [ ] Results grouped, with an empty state
- [ ] Recent commands persist across reloads and appear only on empty query
- [ ] Direct shortcuts work with the palette closed
- [ ] Shortcut hints show the correct modifier for the OS

### Stretch goals

- Nested "pages": selecting "Change theme…" swaps the list to theme options; Backspace on empty query goes back
- Simple ranking: label matches score above keyword matches

---

## #2 Searchable, sortable data table

### What it is

A table of 50–100 records (users or orders) with debounced search, a status filter, sortable headers, pagination with page-size picker, row selection with a bulk-action bar, and per-row actions (edit in a modal, delete with confirmation).

### Packages

`@mantine/core`, `@mantine/hooks`, `@mantine/form`, `@mantine/notifications`

### Components and hooks

- **Core:** `Table` (`Table.Thead`, `Table.Tbody`, `Table.Tr`, `Table.Th`, `Table.Td`, `Table.ScrollContainer`; props `stickyHeader`, `highlightOnHover`), `TextInput`, `SegmentedControl` or `MultiSelect` (status), `Select` (page size), `Pagination`, `Checkbox` (with `indeterminate`), `Menu`, `ActionIcon`, `UnstyledButton` (header cells), `Badge`, `Modal`, `Paper`, `Transition`, `Group`, `Text`, `Center`
- **Hooks:** `useDebouncedValue`, `useDisclosure`
- **Form:** `useForm`

### Row type

Mix of field kinds so sorting is meaningful:

```ts
type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited' | 'suspended';
  createdAt: Date;
  amount: number;
};
```

Generate rows once and keep them in `useState` so edits and deletes can mutate them.

### Build steps

1. **Data and types.** Define the row type and a mock generator.
2. **Derived pipeline (core of the demo).** Raw state: search, status filter, sort, page, page size. In a `useMemo` chain: filter by debounced search (name + email) → filter by status → sort → slice for current page. Keep the filtered+sorted count separately for pagination.
3. **Search and filter.** Debounce search with `useDebouncedValue` (~250ms). Reset page to 1 whenever search, filter, or page size changes.
4. **Sortable headers.** Sort state `{ key, direction }`. Each `Table.Th` wraps an `UnstyledButton` that cycles asc → desc → unsorted, with an icon showing state. One comparator handles strings (`localeCompare`), numbers, and dates.
5. **Pagination.** `total = Math.ceil(filteredCount / pageSize)`; `Select` with 10 / 25 / 50. Show a "Showing 11–20 of 87" label.
6. **Selection.** Selected ids in state. Header `Checkbox` is checked when all rows on the current page are selected, `indeterminate` when some are; clicking toggles the current page. Highlight selected rows. Selection persists across page changes.
7. **Bulk-action bar.** When selection is non-empty, slide in a `Paper` (via `Transition`) showing "N selected" with "Change status" and "Delete". Notify after each action and clear selection.
8. **Row actions.** Last column: `Menu` with `ActionIcon` trigger, items Edit and Delete. Edit opens a `Modal` with `useForm` prefilled from the row, with validation (e.g. email format); submit updates the row. Delete opens a confirmation `Modal`.
9. **Overflow and empty states.** Wrap in `Table.ScrollContainer` with `minWidth`; enable `stickyHeader`. Empty result renders a single row with `colSpan` across all columns: "No results" + "Clear filters" button.

### Acceptance criteria

- [ ] Search is debounced and resets to page 1
- [ ] Status filter combines correctly with search
- [ ] All column types sort in both directions
- [ ] Pagination math and "Showing X–Y of Z" label are correct
- [ ] Header checkbox shows checked and indeterminate states correctly
- [ ] Bulk and row actions update data and show notifications
- [ ] Edit form validates input
- [ ] Table scrolls horizontally on narrow screens; empty state is visible

### Stretch goals

- Column visibility toggle (`Menu` or `Popover` with a `Checkbox` per column), persisted via `useLocalStorage`
- Density toggle via the `verticalSpacing` prop
- Expandable rows using `Collapse` for details

---

## Outlines (detailed specs to come)

### #3 Multi-step onboarding wizard
`Stepper` with `useForm` validating each step before advancing. Inputs: `PasswordInput`, `Select`, `Chip.Group`. Completion confirmed with `notifications.show()`.

### #4 Settings page with live preferences
Vertical `Tabs` with `Switch`, `SegmentedControl`, `ColorInput`, `Slider`. Values persisted via `useLocalStorage`; theme toggle via `useMantineColorScheme`.

### #5 Responsive admin shell
`AppShell` with collapsible navbar (`Burger` + `useDisclosure`), nested `NavLink`s, `Breadcrumbs`, user `Menu` with `Avatar`. `useMediaQuery` switches mobile/desktop behavior.

### #6 File upload manager
`@mantine/dropzone` for file input; each file in a `Card` with a `Progress` bar driven by a simulated upload via `useInterval`. Remove/retry via `ActionIcon`.

### #7 Notification inbox dropdown
Bell `ActionIcon` wrapped in `Indicator` (unread count), opening a `Popover` with a `ScrollArea` list. `Tabs` for "All" / "Unread"; `useListState` for mark-as-read and dismiss.

### #8 Appointment booking widget
`@mantine/dates` `DatePicker` with excluded dates; slots as `Chip.Group` or `TimeGrid` (v8 only). Confirmation `Modal` and a `Timeline` booking summary.

### #9 Chat interface
`ScrollArea` with auto-scroll via `useScrollIntoView`; bubbles from `Avatar`, `Paper`, `Text`. Autosize `Textarea` with Enter-to-send (`getHotkeyHandler`); typing indicator with `Loader`.

### #10 Analytics dashboard
`SimpleGrid` of stat `Card`s with `RingProgress` and trend `Badge`s; `SegmentedControl` for time range. `@mantine/charts`: `AreaChart`, `BarChart`, `DonutChart` (requires `recharts`).