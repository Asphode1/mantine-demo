import { AdminShellDemo } from "~/demos/admin-shell/AdminShellDemo";
import { getDemo } from "~/demos/registry";

export const meta = () => [{ title: `${getDemo("admin-shell").title} · Mantine demos` }];

export default function AdminShellRoute() {
  return <AdminShellDemo />;
}
