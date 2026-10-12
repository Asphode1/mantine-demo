import {
  IconBox,
  IconGauge,
  IconReceipt,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

export const BASE_PATH = "/admin-shell";

export type NavLeaf = { label: string; path: string; description: string };

export type NavSection = {
  label: string;
  icon: React.ReactNode;
  /** Sections without children are links themselves. */
  path?: string;
  description?: string;
  children?: NavLeaf[];
};

const icon = { size: 18, stroke: 1.5 };

export const navigation: NavSection[] = [
  {
    label: "Dashboard",
    icon: <IconGauge {...icon} />,
    path: "",
    description: "Key metrics for today at a glance.",
  },
  {
    label: "Orders",
    icon: <IconReceipt {...icon} />,
    children: [
      { label: "All orders", path: "orders", description: "Every order across channels." },
      { label: "Pending", path: "orders/pending", description: "Orders waiting for fulfilment." },
      { label: "Refunds", path: "orders/refunds", description: "Refund requests and their status." },
    ],
  },
  {
    label: "Products",
    icon: <IconBox {...icon} />,
    children: [
      { label: "Catalog", path: "products", description: "Manage listings and variants." },
      { label: "Inventory", path: "products/inventory", description: "Stock levels per warehouse." },
    ],
  },
  {
    label: "Customers",
    icon: <IconUsers {...icon} />,
    path: "customers",
    description: "Profiles, segments and lifetime value.",
  },
  {
    label: "Settings",
    icon: <IconSettings {...icon} />,
    children: [
      { label: "General", path: "settings", description: "Store name, currency and locale." },
      { label: "Billing", path: "settings/billing", description: "Plan, invoices and payment methods." },
      { label: "Team", path: "settings/team", description: "Staff accounts and permissions." },
    ],
  },
];

export type ResolvedPage = {
  section: NavSection;
  leaf?: NavLeaf;
  title: string;
  description: string;
};

/** Maps a splat path like "orders/pending" back to its nav entry. */
export function resolvePage(splat: string): ResolvedPage | null {
  const path = splat.replace(/\/+$/, "");
  for (const section of navigation) {
    if (section.path === path) {
      return { section, title: section.label, description: section.description ?? "" };
    }
    const leaf = section.children?.find((child) => child.path === path);
    if (leaf) return { section, leaf, title: leaf.label, description: leaf.description };
  }
  return null;
}

export const toHref = (path: string) => (path ? `${BASE_PATH}/${path}` : BASE_PATH);
