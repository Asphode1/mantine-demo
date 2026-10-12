import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode: every demo is client-side only (localStorage, OS detection,
  // clipboard), so server rendering adds hydration noise without benefit.
  ssr: false,
} satisfies Config;
