export type LanguageId =
  | "tsx"
  | "typescript"
  | "javascript"
  | "json"
  | "css"
  | "html"
  | "markdown"
  | "python"
  | "go"
  | "rust"
  | "plaintext";

export type Language = {
  value: LanguageId;
  label: string;
  /** Line comment token used by ⌘/ — `null` when the language has none. */
  comment: string | null;
};

export const languages: Language[] = [
  { value: "tsx", label: "TypeScript JSX", comment: "//" },
  { value: "typescript", label: "TypeScript", comment: "//" },
  { value: "javascript", label: "JavaScript", comment: "//" },
  { value: "json", label: "JSON", comment: null },
  { value: "css", label: "CSS", comment: null },
  { value: "html", label: "HTML", comment: null },
  { value: "markdown", label: "Markdown", comment: null },
  { value: "python", label: "Python", comment: "#" },
  { value: "go", label: "Go", comment: "//" },
  { value: "rust", label: "Rust", comment: "//" },
  { value: "plaintext", label: "Plain Text", comment: null },
];

export function getLanguage(id: LanguageId): Language {
  return languages.find((l) => l.value === id) ?? languages[languages.length - 1];
}

const extensionLanguages: Record<string, LanguageId> = {
  tsx: "tsx",
  ts: "typescript",
  js: "javascript",
  jsx: "javascript",
  json: "json",
  css: "css",
  html: "html",
  md: "markdown",
  py: "python",
  go: "go",
  rs: "rust",
};

export function languageFromPath(path: string): LanguageId {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return extensionLanguages[ext] ?? "plaintext";
}

export type EditorFile = {
  /** Workspace-relative path, also used as the id. */
  path: string;
  content: string;
};

export function fileName(path: string) {
  return path.split("/").pop() ?? path;
}

// ---------------------------------------------------------------------------
// Explorer tree

export type TreeNode =
  | { type: "folder"; name: string; path: string; children: TreeNode[] }
  | { type: "file"; name: string; path: string };

/** Folders first, then files, both alphabetical — the order VS Code's explorer uses. */
export function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const path of paths) {
    const parts = path.split("/");
    let level = root;
    parts.forEach((name, index) => {
      const nodePath = parts.slice(0, index + 1).join("/");
      if (index === parts.length - 1) {
        level.push({ type: "file", name, path: nodePath });
        return;
      }
      let folder = level.find(
        (n): n is Extract<TreeNode, { type: "folder" }> =>
          n.type === "folder" && n.name === name,
      );
      if (!folder) {
        folder = { type: "folder", name, path: nodePath, children: [] };
        level.push(folder);
      }
      level = folder.children;
    });
  }

  const sort = (nodes: TreeNode[]): TreeNode[] =>
    nodes
      .map((n) => (n.type === "folder" ? { ...n, children: sort(n.children) } : n))
      .sort((a, b) =>
        a.type === b.type ? a.name.localeCompare(b.name) : a.type === "folder" ? -1 : 1,
      );

  return sort(root);
}

// ---------------------------------------------------------------------------
// Mock workspace

/** A long generated file so the gutter grows to three digits and the editor scrolls. */
function generateFixtures(count: number) {
  const plans = ["free", "pro", "team", "enterprise"];
  const cities = ["Lisbon", "Osaka", "Denver", "Nairobi", "Oslo", "Lima"];
  const users = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${String(i + 1).padStart(3, "0")}`,
    plan: plans[(i * 7) % plans.length],
    city: cities[(i * 5) % cities.length],
    active: i % 3 !== 0,
  }));
  return JSON.stringify({ users }, null, 2) + "\n";
}

export const initialFiles: EditorFile[] = [
  {
    path: "src/App.tsx",
    content: `import { useState } from "react";
import { useCounter } from "./hooks/useCounter";
import "./styles.css";

type Todo = {
  id: number;
  title: string;
  done: boolean;
};

const initialTodos: Todo[] = [
  { id: 1, title: "Try the ⌘/ comment toggle", done: false },
  { id: 2, title: "Press Tab on a multi-line selection", done: false },
  { id: 3, title: "Save with ⌘S", done: true },
];

export default function App() {
  const [todos, setTodos] = useState(initialTodos);
  const { count, increment, reset } = useCounter(0);

  const toggle = (id: number) => {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  };

  const remaining = todos.filter((todo) => !todo.done).length;

  return (
    <main className="app">
      <h1>Todos ({remaining} left)</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => toggle(todo.id)}>
            <input type="checkbox" checked={todo.done} readOnly />
            {todo.title}
          </li>
        ))}
      </ul>
      <button onClick={increment}>Clicked {count} times</button>
      <button onClick={reset}>Reset</button>
    </main>
  );
}
`,
  },
  {
    path: "src/hooks/useCounter.ts",
    content: `import { useCallback, useState } from "react";

export interface CounterOptions {
  min?: number;
  max?: number;
}

/** Bounded counter with stable callbacks. */
export function useCounter(initial = 0, { min = -Infinity, max = Infinity }: CounterOptions = {}) {
  const [count, setCount] = useState(initial);

  const clamp = (value: number) => Math.min(max, Math.max(min, value));

  const increment = useCallback(() => setCount((c) => clamp(c + 1)), [min, max]);
  const decrement = useCallback(() => setCount((c) => clamp(c - 1)), [min, max]);
  const reset = useCallback(() => setCount(initial), [initial]);

  return { count, increment, decrement, reset } as const;
}
`,
  },
  {
    path: "src/styles.css",
    content: `:root {
  --accent: #4c6ef5;
  --radius: 8px;
}

.app {
  max-width: 480px;
  margin: 4rem auto;
  font-family: system-ui, sans-serif;
}

.app li {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0;
  cursor: pointer;
}

.app button {
  border: 0;
  border-radius: var(--radius);
  background: var(--accent);
  color: white;
  padding: 0.5rem 1rem;
}
`,
  },
  {
    path: "scripts/fib.py",
    content: `from functools import lru_cache


@lru_cache(maxsize=None)
def fib(n: int) -> int:
    """Return the n-th Fibonacci number."""
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)


if __name__ == "__main__":
    for i in range(10):
        print(f"fib({i}) = {fib(i)}")
`,
  },
  {
    path: "server/main.go",
    content: `package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type health struct {
	Status string \`json:"status"\`
}

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(health{Status: "ok"})
	})

	log.Println("listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
`,
  },
  {
    path: "crates/geometry/lib.rs",
    content: `#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

impl Point {
    pub fn distance(&self, other: &Point) -> f64 {
        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn distance_is_symmetric() {
        let a = Point { x: 0.0, y: 0.0 };
        let b = Point { x: 3.0, y: 4.0 };
        assert_eq!(a.distance(&b), 5.0);
        assert_eq!(b.distance(&a), 5.0);
    }
}
`,
  },
  { path: "data/users.json", content: generateFixtures(24) },
  {
    path: "package.json",
    content: `{
  "name": "todo-app",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
`,
  },
  {
    path: "README.md",
    content: `# Todo app

A tiny playground workspace for the **code editor** demo.

## Keyboard

| Shortcut | Action |
| --- | --- |
| \`⌘S\` / \`Ctrl+S\` | Save the active file |
| \`Tab\` / \`Shift+Tab\` | Indent / outdent the selected lines |
| \`⌘/\` / \`Ctrl+/\` | Toggle line comment |
| \`Esc\`, then \`Tab\` | Move focus out of the editor |

> Edits are kept per file until you save; saved files persist in localStorage.
`,
  },
];

export const initialContents: Record<string, string> = Object.fromEntries(
  initialFiles.map((f) => [f.path, f.content]),
);
