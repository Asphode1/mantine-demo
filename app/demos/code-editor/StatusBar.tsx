import { Group, Loader, Menu, UnstyledButton } from "@mantine/core";
import { IconCheck, IconGitBranch } from "@tabler/icons-react";
import type { ReactNode } from "react";

import type { CursorPosition } from "./editing";
import { getLanguage, type LanguageId, languages } from "./files";
import type { EditorColors } from "./shiki";

type StatusBarProps = {
  colors: EditorColors;
  loading: boolean;
  unsaved: number;
  /** `null` when no file is open. */
  file: { cursor: CursorPosition; lineCount: number; language: LanguageId } | null;
  onLanguageChange: (language: LanguageId) => void;
};

function Item({ children }: { children: ReactNode }) {
  return (
    <Group component="span" gap={4} px={8} h="100%" fz={12} wrap="nowrap" style={{ whiteSpace: "nowrap" }}>
      {children}
    </Group>
  );
}

export function StatusBar({ colors, loading, unsaved, file, onLanguageChange }: StatusBarProps) {
  return (
    <Group
      h={24}
      gap={0}
      justify="space-between"
      wrap="nowrap"
      bg={colors.statusBar}
      c={colors.statusBarForeground}
      style={{ overflow: "hidden", borderTop: "1px solid var(--mantine-color-default-border)" }}
    >
      <Group gap={0} h="100%" wrap="nowrap">
        <Item>
          <IconGitBranch size={13} /> main
        </Item>
        <Item>{unsaved ? `● ${unsaved} unsaved` : "All changes saved"}</Item>
        {loading && (
          <Item>
            <Loader size={10} color="currentColor" /> Loading highlighter…
          </Item>
        )}
      </Group>

      {file && (
        <Group gap={0} h="100%" wrap="nowrap">
          <Item>
            Ln {file.cursor.line}, Col {file.cursor.column}
            {file.cursor.selected > 0 && ` (${file.cursor.selected} selected)`}
          </Item>
          <Item>{file.lineCount} lines</Item>
          <Item>Spaces: 2</Item>
          <Item>UTF-8</Item>
          <Item>LF</Item>
          <Menu position="top-end" shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton
                px={8}
                h="100%"
                fz={12}
                c="inherit"
                aria-label="Select language mode"
                style={{ whiteSpace: "nowrap" }}
              >
                {getLanguage(file.language).label}
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Select language mode</Menu.Label>
              {languages.map((l) => (
                <Menu.Item
                  key={l.value}
                  onClick={() => onLanguageChange(l.value)}
                  rightSection={l.value === file.language ? <IconCheck size={14} /> : null}
                >
                  {l.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      )}
    </Group>
  );
}
