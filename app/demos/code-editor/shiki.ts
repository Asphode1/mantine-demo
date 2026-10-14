import { createShikiAdapter } from "@mantine/code-highlight";
import type { HighlighterCore, ThemeRegistrationResolved } from "shiki/core";

export type EditorThemeId =
  | "auto"
  | "dark-plus"
  | "light-plus"
  | "github-dark"
  | "github-light"
  | "one-dark-pro"
  | "dracula"
  | "nord"
  | "solarized-light";

export const editorThemes: { value: EditorThemeId; label: string }[] = [
  { value: "auto", label: "Auto (Dark+ / Light+)" },
  { value: "dark-plus", label: "Dark+" },
  { value: "light-plus", label: "Light+" },
  { value: "github-dark", label: "GitHub Dark" },
  { value: "github-light", label: "GitHub Light" },
  { value: "one-dark-pro", label: "One Dark Pro" },
  { value: "dracula", label: "Dracula" },
  { value: "nord", label: "Nord" },
  { value: "solarized-light", label: "Solarized Light" },
];

/** `auto` follows the app color scheme using VS Code's default themes. */
export function resolveThemeName(theme: EditorThemeId, scheme: "light" | "dark") {
  if (theme !== "auto") return theme;
  return scheme === "dark" ? "dark-plus" : "light-plus";
}

let highlighter: Promise<HighlighterCore> | null = null;

/**
 * Fine-grained shiki bundle: only the grammars and themes the demo uses, with the
 * JavaScript regex engine instead of the oniguruma wasm. Loaded once, on first use.
 */
export function loadShiki() {
  highlighter ??= Promise.all([
    import("shiki/core"),
    import("shiki/engine/javascript"),
  ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
    createHighlighterCore({
      engine: createJavaScriptRegexEngine(),
      themes: [
        import("shiki/themes/dark-plus.mjs"),
        import("shiki/themes/light-plus.mjs"),
        import("shiki/themes/github-dark.mjs"),
        import("shiki/themes/github-light.mjs"),
        import("shiki/themes/one-dark-pro.mjs"),
        import("shiki/themes/dracula.mjs"),
        import("shiki/themes/nord.mjs"),
        import("shiki/themes/solarized-light.mjs"),
      ],
      langs: [
        import("shiki/langs/tsx.mjs"),
        import("shiki/langs/typescript.mjs"),
        import("shiki/langs/javascript.mjs"),
        import("shiki/langs/json.mjs"),
        import("shiki/langs/css.mjs"),
        import("shiki/langs/html.mjs"),
        import("shiki/langs/markdown.mjs"),
        import("shiki/langs/python.mjs"),
        import("shiki/langs/go.mjs"),
        import("shiki/langs/rust.mjs"),
      ],
    }),
  );
  return highlighter;
}

export const shikiAdapter = createShikiAdapter(loadShiki);

export type EditorColors = {
  type: "light" | "dark";
  background: string;
  foreground: string;
  lineNumber: string;
  activeLineNumber: string;
  lineHighlight: string;
  selection: string;
  cursor: string;
  statusBar: string;
  statusBarForeground: string;
};

/** Theme colors shown until shiki has loaded (VS Code's Dark+/Light+ values). */
export function fallbackColors(type: "light" | "dark"): EditorColors {
  return type === "dark"
    ? editorColors({ type, bg: "#1E1E1E", fg: "#D4D4D4", colors: {} })
    : editorColors({ type, bg: "#FFFFFF", fg: "#000000", colors: {} });
}

/** Reads VS Code workbench colors from a shiki theme, falling back to VS Code defaults. */
export function editorColors(
  theme: Pick<ThemeRegistrationResolved, "type" | "bg" | "fg" | "colors">,
): EditorColors {
  const c = theme.colors ?? {};
  const dark = theme.type === "dark";
  return {
    type: dark ? "dark" : "light",
    background: c["editor.background"] ?? theme.bg,
    foreground: c["editor.foreground"] ?? theme.fg,
    lineNumber: c["editorLineNumber.foreground"] ?? (dark ? "#858585" : "#237893"),
    activeLineNumber:
      c["editorLineNumber.activeForeground"] ?? (dark ? "#C6C6C6" : "#0B216F"),
    lineHighlight:
      c["editor.lineHighlightBackground"] ?? (dark ? "#FFFFFF0A" : "#0000000A"),
    selection: c["editor.selectionBackground"] ?? (dark ? "#264F78" : "#ADD6FF"),
    cursor: c["editorCursor.foreground"] ?? (dark ? "#AEAFAD" : "#000000"),
    statusBar: c["statusBar.background"] ?? "#007ACC",
    statusBarForeground: c["statusBar.foreground"] ?? "#FFFFFF",
  };
}
