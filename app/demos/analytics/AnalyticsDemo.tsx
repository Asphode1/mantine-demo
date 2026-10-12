import { AreaChart, BarChart, DonutChart } from "@mantine/charts";
import {
  Button,
  Card,
  Grid,
  Group,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  useComputedColorScheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDownload } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import {
  chartPalette,
  formatCompactCurrency,
  formatCurrency,
  formatInt,
  generateRangeData,
  type TimeRange,
  timeRanges,
  toCsv,
} from "./data";
import { StatCard } from "./StatCard";

export function AnalyticsDemo() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [revenueView, setRevenueView] = useState<"chart" | "table">("chart");
  const scheme = useComputedColorScheme("light");
  const palette = chartPalette[scheme];

  const data = useMemo(() => generateRangeData(range), [range]);
  const rangeMeta = timeRanges.find((r) => r.value === range)!;
  const totalVisits = data.sources.reduce((sum, s) => sum + s.value, 0);

  const exportCsv = () => {
    const blob = new Blob([toCsv(data)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `revenue-${range}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notifications.show({
      color: "teal",
      title: "Report exported",
      message: `revenue-${range}.csv downloaded (${data.revenue.length} rows).`,
    });
  };

  return (
    <Stack>
      {/* Filters live in one row above every chart. */}
      <Group justify="space-between">
        <SegmentedControl
          value={range}
          onChange={(value) => setRange(value as TimeRange)}
          data={timeRanges.map((r) => ({ value: r.value, label: r.label }))}
        />
        <Button variant="default" leftSection={<IconDownload size={16} />} onClick={exportCsv}>
          Export CSV
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }}>
        {data.kpis.map((kpi) => (
          <StatCard key={kpi.key} kpi={kpi} ringColor={palette[0]} comparison={rangeMeta.previous} />
        ))}
      </SimpleGrid>

      <Card withBorder padding="md">
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={600}>Revenue</Text>
            <Text size="xs" c="dimmed">
              Last {rangeMeta.label} compared with the {rangeMeta.previous}
            </Text>
          </div>
          <SegmentedControl
            size="xs"
            value={revenueView}
            onChange={(value) => setRevenueView(value as typeof revenueView)}
            data={[
              { value: "chart", label: "Chart" },
              { value: "table", label: "Table" },
            ]}
          />
        </Group>
        {revenueView === "chart" ? (
          <AreaChart
            h={280}
            data={data.revenue}
            dataKey="label"
            series={[
              { name: "current", label: "This period", color: palette[0] },
              { name: "previous", label: "Previous period", color: palette[1] },
            ]}
            curveType="monotone"
            strokeWidth={2}
            withDots={false}
            withGradient
            fillOpacity={0.15}
            withLegend
            legendProps={{ verticalAlign: "top", height: 36 }}
            gridAxis="x"
            valueFormatter={formatCompactCurrency}
            tooltipAnimationDuration={150}
          />
        ) : (
          <Table.ScrollContainer minWidth={360} maxHeight={280}>
            <Table stickyHeader striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Period</Table.Th>
                  <Table.Th ta="right">This period</Table.Th>
                  <Table.Th ta="right">Previous period</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.revenue.map((point) => (
                  <Table.Tr key={point.label}>
                    <Table.Td>{point.label}</Table.Td>
                    <Table.Td ta="right">{formatCurrency(point.current)}</Table.Td>
                    <Table.Td ta="right">{formatCurrency(point.previous)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder padding="md" h="100%">
            <Text fw={600}>Orders by channel</Text>
            <Text size="xs" c="dimmed" mb="md">
              Last {rangeMeta.label}
            </Text>
            <BarChart
              h={240}
              data={data.channels}
              dataKey="channel"
              series={[{ name: "orders", label: "Orders", color: palette[0] }]}
              barProps={{ radius: [4, 4, 0, 0] }}
              maxBarWidth={48}
              gridAxis="x"
              valueFormatter={formatInt}
              withBarValueLabel
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder padding="md" h="100%">
            <Text fw={600}>Traffic sources</Text>
            <Text size="xs" c="dimmed" mb="md">
              {formatInt(totalVisits)} visits
            </Text>
            <Group justify="center" wrap="nowrap" gap="lg">
              <DonutChart
                size={180}
                thickness={24}
                paddingAngle={2}
                data={data.sources.map((source, i) => ({ ...source, color: palette[i] }))}
                chartLabel={formatInt(totalVisits)}
                valueFormatter={formatInt}
                tooltipDataSource="segment"
              />
              {/* Legend with values so identity never relies on color alone. */}
              <Stack gap={6}>
                {data.sources.map((source, i) => (
                  <Group key={source.name} gap={8} wrap="nowrap">
                    <svg width={10} height={10} aria-hidden>
                      <circle cx={5} cy={5} r={5} fill={`var(--mantine-color-${palette[i].replace(".", "-")})`} />
                    </svg>
                    <Text size="sm">{source.name}</Text>
                    <Text size="sm" c="dimmed">
                      {Math.round((source.value / totalVisits) * 100)}%
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
