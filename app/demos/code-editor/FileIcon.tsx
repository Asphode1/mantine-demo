import {
  IconBrandCss3,
  IconBrandGolang,
  IconBrandHtml5,
  IconBrandJavascript,
  IconBrandPython,
  IconBrandReact,
  IconBrandRust,
  IconBrandTypescript,
  IconFileText,
  IconJson,
  IconMarkdown,
  type Icon,
} from "@tabler/icons-react";

import type { LanguageId } from "./files";

const icons: Record<LanguageId, { icon: Icon; color: string }> = {
  tsx: { icon: IconBrandReact, color: "var(--mantine-color-cyan-5)" },
  typescript: { icon: IconBrandTypescript, color: "var(--mantine-color-blue-6)" },
  javascript: { icon: IconBrandJavascript, color: "var(--mantine-color-yellow-5)" },
  json: { icon: IconJson, color: "var(--mantine-color-yellow-7)" },
  css: { icon: IconBrandCss3, color: "var(--mantine-color-indigo-5)" },
  html: { icon: IconBrandHtml5, color: "var(--mantine-color-orange-6)" },
  markdown: { icon: IconMarkdown, color: "var(--mantine-color-gray-6)" },
  python: { icon: IconBrandPython, color: "var(--mantine-color-blue-5)" },
  go: { icon: IconBrandGolang, color: "var(--mantine-color-cyan-6)" },
  rust: { icon: IconBrandRust, color: "var(--mantine-color-orange-7)" },
  plaintext: { icon: IconFileText, color: "var(--mantine-color-gray-6)" },
};

export function FileIcon({ language, size = 16 }: { language: LanguageId; size?: number }) {
  const { icon: Component, color } = icons[language];
  return <Component size={size} color={color} stroke={1.75} style={{ flex: "none" }} />;
}
