import { Box } from "@mantine/core";
import { useHighlight } from "@mantine/code-highlight";
import { type CSSProperties, type KeyboardEvent, useMemo, useRef } from "react";

import classes from "./CodeEditor.module.css";
import {
  countLines,
  type CursorPosition,
  cursorPosition,
  type Edit,
  indent,
  newline,
  outdent,
  toggleLineComment,
} from "./editing";
import type { LanguageId } from "./files";
import type { EditorColors } from "./shiki";

const FONT_SIZE = 13;
const LINE_HEIGHT = 20;
const PADDING = 8;

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: LanguageId;
  /** Shiki theme name passed to the highlighter. */
  theme: string;
  colors: EditorColors;
  activeLine: number;
  onCursorChange: (cursor: CursorPosition) => void;
  commentToken: string | null;
  onCommentUnsupported: () => void;
  h: number | string;
};

/**
 * Applies an edit through `insertText` so it lands on the browser's native
 * undo stack (⌘Z keeps working). Falls back to `setRangeText` where unsupported.
 */
function applyEdit(el: HTMLTextAreaElement, edit: Edit) {
  el.setSelectionRange(edit.start, edit.end);
  if (!document.execCommand("insertText", false, edit.text)) {
    el.setRangeText(edit.text, edit.start, edit.end);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
  el.setSelectionRange(edit.selectionStart, edit.selectionEnd);
}

export function CodeEditor({
  value,
  onChange,
  language,
  theme,
  colors,
  activeLine,
  onCursorChange,
  commentToken,
  onCommentUnsupported,
  h,
}: CodeEditorProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // After Esc, the next Tab moves focus instead of indenting (as in VS Code / CodeMirror).
  const releaseTab = useRef(false);
  const highlight = useHighlight();

  const highlighted = useMemo(
    () => highlight({ code: value, language, colorScheme: theme }),
    [highlight, value, language, theme],
  );
  const lineCount = countLines(value);
  const digits = String(lineCount).length;

  const reportCursor = (el: HTMLTextAreaElement) => {
    const caret = el.selectionDirection === "backward" ? el.selectionStart : el.selectionEnd;
    onCursorChange(cursorPosition(el.value, el.selectionStart, el.selectionEnd, caret));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = event.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;
    const mod = event.metaKey || event.ctrlKey;

    if (event.key === "Escape") {
      releaseTab.current = true;
      return;
    }
    const released = releaseTab.current;
    releaseTab.current = false;

    let edit: Edit | null = null;
    if (event.key === "Tab" && !mod && !event.altKey) {
      if (released) return;
      event.preventDefault();
      edit = event.shiftKey ? outdent(el.value, start, end) : indent(el.value, start, end);
    } else if (event.key === "Enter" && !mod && !event.altKey && !event.shiftKey) {
      event.preventDefault();
      edit = newline(el.value, start, end);
    } else if (event.key === "/" && mod) {
      event.preventDefault();
      if (!commentToken) return onCommentUnsupported();
      edit = toggleLineComment(el.value, start, end, commentToken);
    }

    if (edit) {
      applyEdit(el, edit);
      reportCursor(el);
    }
  };

  /** Clicking a line number selects that line, like VS Code's gutter. */
  const selectLine = (line: number) => {
    const el = inputRef.current;
    if (!el) return;
    const lines = el.value.split("\n");
    const start = lines.slice(0, line - 1).reduce((sum, l) => sum + l.length + 1, 0);
    const end = Math.min(el.value.length, start + lines[line - 1].length + 1);
    el.focus();
    el.setSelectionRange(start, end);
    reportCursor(el);
  };

  const vars = {
    "--editor-bg": colors.background,
    "--editor-fg": colors.foreground,
    "--editor-scheme": colors.type,
    "--editor-line-number": colors.lineNumber,
    "--editor-active-line-number": colors.activeLineNumber,
    "--editor-line-highlight": colors.lineHighlight,
    "--editor-selection": colors.selection,
    "--editor-cursor": colors.cursor,
    "--editor-font-size": `${FONT_SIZE}px`,
    "--editor-line-height": `${LINE_HEIGHT}px`,
    "--editor-padding": `${PADDING}px`,
  } as CSSProperties;

  return (
    <Box className={classes.scroller} h={h} style={vars}>
      <div
        className={classes.content}
        style={{ minHeight: lineCount * LINE_HEIGHT + PADDING * 2 }}
      >
        <div className={classes.gutter} aria-hidden>
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className={classes.lineNumber}
              style={{ minWidth: `${digits}ch` }}
              data-active={i + 1 === activeLine || undefined}
              onMouseDown={(event) => {
                event.preventDefault();
                selectLine(i + 1);
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className={classes.code}>
          <div
            className={classes.activeLine}
            style={{ top: PADDING + (activeLine - 1) * LINE_HEIGHT }}
          />
          <textarea
            ref={inputRef}
            className={classes.input}
            value={value}
            onChange={(event) => {
              onChange(event.currentTarget.value);
              reportCursor(event.currentTarget);
            }}
            onSelect={(event) => reportCursor(event.currentTarget)}
            onKeyDown={handleKeyDown}
            wrap="off"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-label="Code editor"
            aria-multiline
            data-gramm="false"
          />
          <pre className={classes.highlight} aria-hidden>
            {highlighted.isHighlighted ? (
              <code dangerouslySetInnerHTML={{ __html: highlighted.highlightedCode }} />
            ) : (
              <code>{value}</code>
            )}
          </pre>
        </div>
      </div>
    </Box>
  );
}
