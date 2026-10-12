import { Badge, Card, Group, RingProgress, Text } from "@mantine/core";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { type Kpi, percentChange } from "./data";

export function StatCard({ kpi, ringColor, comparison }: { kpi: Kpi; ringColor: string; comparison: string }) {
  const change = percentChange(kpi.value, kpi.previous);
  const up = change >= 0;
  const goalPct = Math.min(100, Math.round((kpi.value / kpi.goal) * 100));

  return (
    <Card withBorder padding="md">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {kpi.label}
          </Text>
          <Text fw={700} fz={26} lh={1.2} mt={4}>
            {kpi.format(kpi.value)}
          </Text>
          {/* Status: icon + sign + text, never color alone. */}
          <Badge
            mt={8}
            variant="light"
            color={up ? "teal" : "red"}
            leftSection={up ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
            tt="none"
          >
            {up ? "+" : ""}
            {change.toFixed(1)}%
          </Badge>
          <Text size="xs" c="dimmed" mt={4}>
            vs {comparison}
          </Text>
        </div>
        <RingProgress
          size={76}
          thickness={7}
          roundCaps
          sections={[{ value: goalPct, color: ringColor, tooltip: `${goalPct}% of goal (${kpi.format(kpi.goal)})` }]}
          label={
            <Text ta="center" size="xs" fw={700}>
              {goalPct}%
            </Text>
          }
          aria-label={`${goalPct}% of goal`}
        />
      </Group>
    </Card>
  );
}
