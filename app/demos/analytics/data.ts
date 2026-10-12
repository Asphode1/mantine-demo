export type TimeRange = "7d" | "30d" | "90d" | "12m";

export const timeRanges: { value: TimeRange; label: string; previous: string }[] = [
  { value: "7d", label: "7 days", previous: "previous 7 days" },
  { value: "30d", label: "30 days", previous: "previous 30 days" },
  { value: "90d", label: "90 days", previous: "previous 90 days" },
  { value: "12m", label: "12 months", previous: "previous 12 months" },
];

/**
 * Categorical palette, validated with the dataviz palette checker (lightness band,
 * CVD separation, contrast) against Mantine's light (#fff) and dark (#242424) surfaces.
 * Order is fixed: a series keeps its slot whatever else is shown.
 */
export const chartPalette = {
  light: ["indigo.6", "teal.7", "grape.6", "orange.8"],
  dark: ["indigo.5", "teal.7", "grape.5", "orange.8"],
} as const;

export type Kpi = {
  key: string;
  label: string;
  value: number;
  previous: number;
  /** Target for the period; RingProgress shows value / goal. */
  goal: number;
  format: (value: number) => string;
};

export type RangeData = {
  kpis: Kpi[];
  revenue: { label: string; current: number; previous: number }[];
  channels: { channel: string; orders: number }[];
  sources: { name: string; value: number }[];
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const int = new Intl.NumberFormat("en-US");

export const formatCurrency = (value: number) => usd.format(value);
export const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" }).format(value);
export const formatInt = (value: number) => int.format(value);

const rangeConfig: Record<TimeRange, { points: number; unit: "day" | "week" | "month"; seed: number }> = {
  "7d": { points: 7, unit: "day", seed: 7 },
  "30d": { points: 30, unit: "day", seed: 30 },
  "90d": { points: 13, unit: "week", seed: 90 },
  "12m": { points: 12, unit: "month", seed: 365 },
};

function bucketLabel(unit: "day" | "week" | "month", stepsAgo: number): string {
  const date = new Date();
  if (unit === "day") date.setDate(date.getDate() - stepsAgo);
  if (unit === "week") date.setDate(date.getDate() - stepsAgo * 7);
  if (unit === "month") date.setMonth(date.getMonth() - stepsAgo);
  return date.toLocaleDateString("en-US", unit === "month" ? { month: "short" } : { month: "short", day: "numeric" });
}

export function generateRangeData(range: TimeRange): RangeData {
  const { points, unit, seed } = rangeConfig[range];
  const random = mulberry32(seed);
  const perPoint = unit === "day" ? 4200 : unit === "week" ? 29000 : 125000;

  const revenue = Array.from({ length: points }, (_, i) => {
    const trend = 1 + (i / points) * 0.25;
    const seasonal = 1 + 0.12 * Math.sin((i / points) * Math.PI * 2);
    const current = Math.round(perPoint * trend * seasonal * (0.85 + random() * 0.3));
    const previous = Math.round(perPoint * seasonal * (0.8 + random() * 0.3));
    return { label: bucketLabel(unit, points - 1 - i), current, previous };
  });

  const totalRevenue = revenue.reduce((sum, p) => sum + p.current, 0);
  const prevRevenue = revenue.reduce((sum, p) => sum + p.previous, 0);
  const aov = 62 + random() * 18;
  const orders = Math.round(totalRevenue / aov);
  const prevOrders = Math.round(prevRevenue / (aov * (0.95 + random() * 0.1)));
  const conversion = 2.4 + random() * 1.2;
  const prevConversion = conversion * (0.9 + random() * 0.2);

  const channelNames = ["Web", "Mobile app", "Marketplace", "Retail"];
  const channelWeights = [0.42, 0.31, 0.17, 0.1].map((w) => w * (0.85 + random() * 0.3));
  const weightSum = channelWeights.reduce((a, b) => a + b, 0);

  const sourceNames = ["Organic", "Paid", "Social", "Referral"];
  const sourceWeights = [0.38, 0.27, 0.21, 0.14].map((w) => w * (0.8 + random() * 0.4));
  const sourceSum = sourceWeights.reduce((a, b) => a + b, 0);
  const visits = Math.round(orders / (conversion / 100));

  return {
    kpis: [
      { key: "revenue", label: "Revenue", value: totalRevenue, previous: prevRevenue, goal: prevRevenue * 1.35, format: formatCompactCurrency },
      { key: "orders", label: "Orders", value: orders, previous: prevOrders, goal: prevOrders * 1.45, format: formatInt },
      { key: "conversion", label: "Conversion", value: conversion, previous: prevConversion, goal: 4, format: (v) => `${v.toFixed(2)}%` },
      { key: "aov", label: "Avg. order value", value: totalRevenue / orders, previous: prevRevenue / prevOrders, goal: 80, format: formatCurrency },
    ],
    revenue,
    channels: channelNames.map((channel, i) => ({
      channel,
      orders: Math.round((orders * channelWeights[i]) / weightSum),
    })),
    sources: sourceNames.map((name, i) => ({
      name,
      value: Math.round((visits * sourceWeights[i]) / sourceSum),
    })),
  };
}

export const percentChange = (value: number, previous: number) =>
  previous === 0 ? 0 : ((value - previous) / previous) * 100;

export function toCsv(data: RangeData): string {
  const rows = [["period", "revenue", "previous_revenue"], ...data.revenue.map((p) => [p.label, p.current, p.previous])];
  return rows.map((row) => row.join(",")).join("\n");
}
