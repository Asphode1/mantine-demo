import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/gallery-layout.tsx", [
    index("routes/home.tsx"),
    route("command-palette", "routes/command-palette.tsx"),
    route("data-table", "routes/data-table.tsx"),
    route("onboarding-wizard", "routes/onboarding-wizard.tsx"),
    route("settings", "routes/settings.tsx"),
    route("file-upload", "routes/file-upload.tsx"),
    route("notification-inbox", "routes/notification-inbox.tsx"),
    route("booking", "routes/booking.tsx"),
    route("chat", "routes/chat.tsx"),
    route("analytics", "routes/analytics.tsx"),
    route("code-editor", "routes/code-editor.tsx"),
  ]),
  // The admin shell owns the whole viewport, so it sits outside the gallery layout.
  route("admin-shell/*", "routes/admin-shell.tsx"),
] satisfies RouteConfig;
