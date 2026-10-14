/**
 * Pure text-editing helpers. Each command takes the current text and selection
 * and returns an `Edit`: the range to replace, its replacement and where the
 * selection ends up. Applying it is left to the component, so these stay testable.
 */

export const TAB_SIZE = 2;

export type Edit = {
  start: number;
  end: number;
  text: string;
  selectionStart: number;
  selectionEnd: number;
};

export type CursorPosition = {
  line: number;
  column: number;
  /** Number of selected characters, 0 for a plain caret. */
  selected: number;
};

export function cursorPosition(
  value: string,
  start: number,
  end: number,
  caret: number,
): CursorPosition {
  const lineStart = value.lastIndexOf("\n", caret - 1) + 1;
  let line = 1;
  for (let i = 0; i < lineStart; i++) if (value[i] === "\n") line++;
  return { line, column: caret - lineStart + 1, selected: end - start };
}

export function countLines(value: string) {
  let lines = 1;
  for (let i = 0; i < value.length; i++) if (value[i] === "\n") lines++;
  return lines;
}

function lineStartOf(value: string, offset: number) {
  return value.lastIndexOf("\n", offset - 1) + 1;
}

function lineEndOf(value: string, offset: number) {
  const end = value.indexOf("\n", offset);
  return end === -1 ? value.length : end;
}

/** Whole-line range touched by a selection. A selection ending at column 1 does not include that line. */
function selectedBlock(value: string, start: number, end: number) {
  const lastOffset = end > start && value[end - 1] === "\n" ? end - 1 : end;
  const from = lineStartOf(value, start);
  const to = lineEndOf(value, lastOffset);
  return { from, to, lines: value.slice(from, to).split("\n") };
}

/**
 * Replaces the lines touched by the selection. A caret keeps its place on its line
 * (shifted by `caretShift`); a range selection expands to cover the rewritten lines.
 */
function rewriteBlock(
  value: string,
  start: number,
  end: number,
  rewrite: (lines: string[]) => { lines: string[]; caretShift: number },
): Edit | null {
  const { from, to, lines } = selectedBlock(value, start, end);
  const result = rewrite(lines);
  const text = result.lines.join("\n");
  if (text === value.slice(from, to)) return null;

  if (start === end) {
    const caret = Math.max(from, start + result.caretShift);
    return { start: from, end: to, text, selectionStart: caret, selectionEnd: caret };
  }
  return { start: from, end: to, text, selectionStart: from, selectionEnd: from + text.length };
}

const leadingWhitespace = (line: string) => line.match(/^[ \t]*/)![0];

/** Tab: indent every selected line, or insert spaces up to the next tab stop. */
export function indent(value: string, start: number, end: number): Edit | null {
  if (value.slice(start, end).includes("\n")) {
    return rewriteBlock(value, start, end, (lines) => ({
      lines: lines.map((l) => (l.length ? " ".repeat(TAB_SIZE) + l : l)),
      caretShift: TAB_SIZE,
    }));
  }
  const column = start - lineStartOf(value, start);
  const spaces = " ".repeat(TAB_SIZE - (column % TAB_SIZE));
  const caret = start + spaces.length;
  return { start, end, text: spaces, selectionStart: caret, selectionEnd: caret };
}

/** Shift+Tab: remove up to one indent level from every selected line. */
export function outdent(value: string, start: number, end: number): Edit | null {
  return rewriteBlock(value, start, end, (lines) => {
    const removed = lines.map((l) => {
      const ws = leadingWhitespace(l);
      return ws.startsWith("\t") ? 1 : Math.min(TAB_SIZE, ws.length);
    });
    return {
      lines: lines.map((l, i) => l.slice(removed[i])),
      caretShift: -removed[0],
    };
  });
}

const closers: Record<string, string> = { "{": "}", "[": "]", "(": ")" };

/** Enter: keep the current indentation, add a level after an opening bracket. */
export function newline(value: string, start: number, end: number): Edit {
  const lineStart = lineStartOf(value, start);
  const indentation = leadingWhitespace(value.slice(lineStart, start));
  const before = value[start - 1];
  const after = value[end];
  const opener = before ? closers[before] : undefined;
  const step = " ".repeat(TAB_SIZE);

  if (opener && after === opener) {
    // `{|}` → put the caret on an indented line between the brackets.
    const text = `\n${indentation}${step}\n${indentation}`;
    const caret = start + 1 + indentation.length + step.length;
    return { start, end, text, selectionStart: caret, selectionEnd: caret };
  }

  const text = `\n${indentation}${opener ? step : ""}`;
  const caret = start + text.length;
  return { start, end, text, selectionStart: caret, selectionEnd: caret };
}

/** ⌘/: comment the selected lines, or uncomment them if they are all commented. */
export function toggleLineComment(
  value: string,
  start: number,
  end: number,
  token: string,
): Edit | null {
  return rewriteBlock(value, start, end, (lines) => {
    const filled = lines.filter((l) => l.trim().length);
    if (!filled.length) return { lines, caretShift: 0 };

    const commented = filled.every((l) => l.trimStart().startsWith(token));
    if (commented) {
      let firstShift = 0;
      const next = lines.map((l, i) => {
        const ws = leadingWhitespace(l);
        const rest = l.slice(ws.length);
        if (!rest.startsWith(token)) return l;
        const cut = token.length + (rest[token.length] === " " ? 1 : 0);
        if (i === 0) firstShift = -cut;
        return ws + rest.slice(cut);
      });
      return { lines: next, caretShift: firstShift };
    }

    // Comment at the shallowest indentation so the markers line up.
    const column = Math.min(...filled.map((l) => leadingWhitespace(l).length));
    const marker = `${token} `;
    return {
      lines: lines.map((l) =>
        l.trim().length ? l.slice(0, column) + marker + l.slice(column) : l,
      ),
      caretShift: lines[0].trim().length ? marker.length : 0,
    };
  });
}
