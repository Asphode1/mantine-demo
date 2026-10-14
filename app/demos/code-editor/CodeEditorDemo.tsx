import {
  ActionIcon,
  Box,
  Breadcrumbs,
  Button,
  Center,
  Group,
  Kbd,
  Menu,
  Modal,
  NavLink,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
} from "@mantine/core";
import { CodeHighlight, CodeHighlightAdapterProvider } from "@mantine/code-highlight";
import { useClipboard, useDisclosure, useHotkeys, useLocalStorage, useOs } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowBackUp,
  IconCopy,
  IconDeviceFloppy,
  IconFileDiff,
  IconFiles,
  IconFolder,
  IconFolderOpen,
  IconRestore,
} from "@tabler/icons-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import type { HighlighterCore } from "shiki/core";

import { CodeEditor } from "./CodeEditor";
import { countLines, type CursorPosition } from "./editing";
import { EditorTabs } from "./EditorTabs";
import {
  buildTree,
  fileName,
  getLanguage,
  initialContents,
  initialFiles,
  type LanguageId,
  languageFromPath,
  type TreeNode,
} from "./files";
import { FileIcon } from "./FileIcon";
import {
  editorColors,
  type EditorThemeId,
  editorThemes,
  fallbackColors,
  loadShiki,
  resolveThemeName,
  shikiAdapter,
} from "./shiki";
import { StatusBar } from "./StatusBar";

const EDITOR_HEIGHT = 480;
const startCursor: CursorPosition = { line: 1, column: 1, selected: 0 };
const tree = buildTree(initialFiles.map((f) => f.path));

export function CodeEditorDemo() {
  return (
    <CodeHighlightAdapterProvider adapter={shikiAdapter}>
      <Workbench />
    </CodeHighlightAdapterProvider>
  );
}

function Workbench() {
  const os = useOs();
  const mod = os === "macos" ? "⌘" : "Ctrl";
  const scheme = useComputedColorScheme("light");
  const clipboard = useClipboard({ timeout: 1500 });
  const [savedOpened, savedModal] = useDisclosure(false);

  // Saved contents persist across reloads; unsaved edits live only in memory.
  const [saved, setSaved] = useLocalStorage<Record<string, string>>({
    key: "code-editor:files",
    defaultValue: initialContents,
    getInitialValueInEffect: false,
  });
  const [themeId, setThemeId] = useLocalStorage<EditorThemeId>({
    key: "code-editor:theme",
    defaultValue: "auto",
    getInitialValueInEffect: false,
  });
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [languageOverrides, setLanguageOverrides] = useState<Record<string, LanguageId>>({});
  const [openPaths, setOpenPaths] = useState(["src/App.tsx", "src/hooks/useCounter.ts", "README.md"]);
  const [activePath, setActivePath] = useState<string | null>("src/App.tsx");
  const [cursor, setCursor] = useState(startCursor);

  const [shiki, setShiki] = useState<HighlighterCore | null>(null);
  useEffect(() => {
    let active = true;
    loadShiki().then((highlighter) => active && setShiki(highlighter));
    return () => {
      active = false;
    };
  }, []);

  const themeName = resolveThemeName(themeId, scheme);
  const colors = useMemo(
    () => (shiki ? editorColors(shiki.getTheme(themeName)) : fallbackColors(scheme)),
    [shiki, themeName, scheme],
  );

  const contentOf = (path: string) => drafts[path] ?? saved[path] ?? initialContents[path];
  const isDirty = (path: string) => path in drafts && drafts[path] !== saved[path];
  const languageOf = (path: string) => languageOverrides[path] ?? languageFromPath(path);
  const unsavedPaths = Object.keys(drafts).filter(isDirty);

  const activeContent = activePath ? contentOf(activePath) : "";
  const activeLanguage = activePath ? languageOf(activePath) : "plaintext";
  const activeDirty = activePath ? isDirty(activePath) : false;

  const openFile = (path: string) => {
    setOpenPaths((current) => (current.includes(path) ? current : [...current, path]));
    if (path !== activePath) setCursor(startCursor);
    setActivePath(path);
  };

  const closeFile = (path: string) => {
    const index = openPaths.indexOf(path);
    const next = openPaths.filter((p) => p !== path);
    setOpenPaths(next);
    if (path === activePath) {
      setActivePath(next[Math.min(index, next.length - 1)] ?? null);
      setCursor(startCursor);
    }
    if (isDirty(path)) {
      notifications.show({
        color: "yellow",
        title: `${fileName(path)} closed`,
        message: "Unsaved changes are kept — reopen it from the explorer to continue.",
      });
    }
  };

  const save = (paths: string[]) => {
    const dirty = paths.filter(isDirty);
    if (!dirty.length) {
      notifications.show({ color: "gray", title: "Nothing to save", message: "All changes are already saved." });
      return;
    }
    setSaved((current) => ({ ...current, ...Object.fromEntries(dirty.map((p) => [p, drafts[p]])) }));
    setDrafts((current) => {
      const next = { ...current };
      for (const p of paths) delete next[p];
      return next;
    });
    notifications.show({
      color: "teal",
      title: dirty.length === 1 ? `Saved ${fileName(dirty[0])}` : `Saved ${dirty.length} files`,
      message: dirty.join(", "),
    });
  };

  const revert = (path: string) => {
    setDrafts(({ [path]: _, ...rest }) => rest);
    notifications.show({ color: "blue", title: "Changes discarded", message: `${path} reverted to the saved version.` });
  };

  const resetWorkspace = () => {
    setSaved(initialContents);
    setDrafts({});
    setLanguageOverrides({});
    notifications.show({ color: "blue", title: "Workspace reset", message: "All files restored to their original contents." });
  };

  const copy = () => {
    clipboard.copy(activeContent);
    notifications.show({
      color: "teal",
      title: "Copied to clipboard",
      message: `${countLines(activeContent)} lines from ${activePath}`,
    });
  };

  const changeLanguage = (path: string, language: LanguageId) => {
    setLanguageOverrides((current) => ({ ...current, [path]: language }));
    notifications.show({ title: "Language mode changed", message: `${fileName(path)} → ${getLanguage(language).label}` });
  };

  // `[]` so ⌘S also works while typing in the editor's textarea.
  useHotkeys([["mod+S", () => activePath && save([activePath])]], []);

  const renderTree = (nodes: TreeNode[]) =>
    nodes.map((node) =>
      node.type === "folder" ? (
        <FolderLink key={node.path} name={node.name}>
          {renderTree(node.children)}
        </FolderLink>
      ) : (
        <NavLink
          key={node.path}
          label={node.name}
          title={node.path}
          leftSection={<FileIcon language={languageOf(node.path)} size={15} />}
          rightSection={isDirty(node.path) ? <Text size="xs" c="dimmed">●</Text> : null}
          active={node.path === activePath}
          onClick={() => openFile(node.path)}
          py={4}
        />
      ),
    );

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Select
          label="Color theme"
          data={editorThemes}
          value={themeId}
          onChange={(value) => value && setThemeId(value as EditorThemeId)}
          allowDeselect={false}
          w={220}
          size="xs"
        />
        <Group gap="xs" align="flex-end" style={{ alignSelf: "flex-end" }}>
          <Button
            size="xs"
            variant="default"
            leftSection={<IconDeviceFloppy size={14} />}
            disabled={!unsavedPaths.length}
            onClick={() => save(unsavedPaths)}
          >
            Save all{unsavedPaths.length ? ` (${unsavedPaths.length})` : ""}
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <Group gap={0} wrap="nowrap" align="stretch">
          <Box
            w={220}
            visibleFrom="sm"
            style={{ flex: "none", borderRight: "1px solid var(--mantine-color-default-border)" }}
          >
            <Group justify="space-between" px="sm" h={38}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Explorer
              </Text>
              <Tooltip label="Reset workspace">
                <ActionIcon variant="subtle" color="gray" size="sm" onClick={resetWorkspace} aria-label="Reset workspace">
                  <IconRestore size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <ScrollArea h={EDITOR_HEIGHT + 36}>{renderTree(tree)}</ScrollArea>
          </Box>

          <Box style={{ flex: 1, minWidth: 0 }}>
            <EditorTabs
              paths={openPaths}
              activePath={activePath}
              isDirty={isDirty}
              languageOf={languageOf}
              onActivate={openFile}
              onClose={closeFile}
            />

            <Group justify="space-between" wrap="nowrap" px="sm" h={36} gap="xs">
              <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                <Menu position="bottom-start" shadow="md" width={240}>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" size="sm" hiddenFrom="sm" aria-label="Open file">
                      <IconFiles size={14} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    {initialFiles.map((f) => (
                      <Menu.Item
                        key={f.path}
                        leftSection={<FileIcon language={languageOf(f.path)} size={14} />}
                        onClick={() => openFile(f.path)}
                      >
                        {f.path}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
                {activePath && (
                  <Breadcrumbs separator="›" separatorMargin={4} style={{ minWidth: 0, flexWrap: "nowrap" }}>
                    {activePath.split("/").map((part, i, parts) => (
                      <Group key={i} gap={4} wrap="nowrap">
                        {i === parts.length - 1 && <FileIcon language={activeLanguage} size={13} />}
                        <Text size="xs" c={i === parts.length - 1 ? undefined : "dimmed"}>
                          {part}
                        </Text>
                      </Group>
                    ))}
                  </Breadcrumbs>
                )}
              </Group>

              {activePath && (
                <Group gap={2} wrap="nowrap">
                  <Tooltip label={clipboard.copied ? "Copied" : "Copy file contents"}>
                    <ActionIcon variant="subtle" color="gray" size="sm" onClick={copy} aria-label="Copy file contents">
                      <IconCopy size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="View saved version">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      disabled={!activeDirty}
                      onClick={savedModal.open}
                      aria-label="View saved version"
                    >
                      <IconFileDiff size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Revert file">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      disabled={!activeDirty}
                      onClick={() => revert(activePath)}
                      aria-label="Revert file"
                    >
                      <IconArrowBackUp size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label={`Save (${mod}+S)`}>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      disabled={!activeDirty}
                      onClick={() => save([activePath])}
                      aria-label="Save file"
                    >
                      <IconDeviceFloppy size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              )}
            </Group>

            {activePath ? (
              <CodeEditor
                key={activePath}
                h={EDITOR_HEIGHT}
                value={activeContent}
                onChange={(value) => setDrafts((current) => ({ ...current, [activePath]: value }))}
                language={activeLanguage}
                theme={themeName}
                colors={colors}
                activeLine={cursor.line}
                onCursorChange={setCursor}
                commentToken={getLanguage(activeLanguage).comment}
                onCommentUnsupported={() =>
                  notifications.show({
                    color: "gray",
                    title: "No line comments",
                    message: `${getLanguage(activeLanguage).label} has no line comment syntax.`,
                  })
                }
              />
            ) : (
              <Center h={EDITOR_HEIGHT} bg={colors.background}>
                <Stack gap={6} align="center" c={colors.lineNumber}>
                  <Text size="sm">No file open — pick one from the explorer.</Text>
                  <Text size="xs">
                    <Kbd size="xs">{mod}</Kbd> + <Kbd size="xs">S</Kbd> save · <Kbd size="xs">{mod}</Kbd> +{" "}
                    <Kbd size="xs">/</Kbd> comment · <Kbd size="xs">Tab</Kbd> indent
                  </Text>
                </Stack>
              </Center>
            )}
          </Box>
        </Group>

        <StatusBar
          colors={colors}
          loading={!shiki}
          unsaved={unsavedPaths.length}
          file={
            activePath
              ? { cursor, lineCount: countLines(activeContent), language: activeLanguage }
              : null
          }
          onLanguageChange={(language) => activePath && changeLanguage(activePath, language)}
        />
      </Paper>

      <Text size="xs" c="dimmed">
        <Kbd size="xs">Tab</Kbd> / <Kbd size="xs">Shift</Kbd>+<Kbd size="xs">Tab</Kbd> indent and outdent lines ·{" "}
        <Kbd size="xs">{mod}</Kbd>+<Kbd size="xs">/</Kbd> toggles comments · <Kbd size="xs">Enter</Kbd> keeps
        indentation · click a line number to select the line · <Kbd size="xs">Esc</Kbd> then{" "}
        <Kbd size="xs">Tab</Kbd> leaves the editor.
      </Text>

      <Modal
        opened={savedOpened && activeDirty}
        onClose={savedModal.close}
        title={activePath ? `${activePath} — saved version` : undefined}
        size="xl"
      >
        {activePath && (
          <CodeHighlight
            code={saved[activePath] ?? ""}
            language={activeLanguage}
            codeColorScheme={themeName}
            background={colors.background}
            withLineNumbers
            withBorder
            radius="sm"
          />
        )}
      </Modal>
    </Stack>
  );
}

function FolderLink({ name, children }: { name: string; children: ReactNode }) {
  const [opened, setOpened] = useState(true);
  const Icon = opened ? IconFolderOpen : IconFolder;
  return (
    <NavLink
      label={name}
      leftSection={<Icon size={15} style={{ flex: "none" }} />}
      opened={opened}
      onChange={setOpened}
      childrenOffset={12}
      py={4}
    >
      {children}
    </NavLink>
  );
}
