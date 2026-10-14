import { Box, Center, CloseButton, Group, ScrollArea, UnstyledButton } from "@mantine/core";

import classes from "./EditorTabs.module.css";
import { fileName, type LanguageId } from "./files";
import { FileIcon } from "./FileIcon";

type EditorTabsProps = {
  paths: string[];
  activePath: string | null;
  isDirty: (path: string) => boolean;
  languageOf: (path: string) => LanguageId;
  onActivate: (path: string) => void;
  onClose: (path: string) => void;
};

export function EditorTabs({
  paths,
  activePath,
  isDirty,
  languageOf,
  onActivate,
  onClose,
}: EditorTabsProps) {
  return (
    <ScrollArea className={classes.strip} type="hover" scrollbarSize={4} offsetScrollbars={false}>
      <Group gap={0} wrap="nowrap" role="tablist" aria-label="Open files">
        {paths.map((path) => {
          const name = fileName(path);
          const active = path === activePath;
          return (
            <div
              key={path}
              className={classes.tab}
              data-active={active || undefined}
              data-dirty={isDirty(path) || undefined}
              // Middle-click closes, like a browser or VS Code tab.
              onAuxClick={(event) => event.button === 1 && onClose(path)}
            >
              <UnstyledButton
                className={classes.label}
                role="tab"
                aria-selected={active}
                title={path}
                onClick={() => onActivate(path)}
              >
                <FileIcon language={languageOf(path)} size={15} />
                {name}
              </UnstyledButton>
              <Center className={classes.dirty} w={22} h={22} aria-hidden>
                <Box w={8} h={8} bg="currentColor" style={{ borderRadius: "50%" }} />
              </Center>
              <CloseButton
                className={classes.close}
                size="sm"
                aria-label={`Close ${name}`}
                onClick={() => onClose(path)}
              />
            </div>
          );
        })}
      </Group>
    </ScrollArea>
  );
}
