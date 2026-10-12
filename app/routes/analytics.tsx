import { Container } from "@mantine/core";

import { DemoHeader } from "~/components/DemoHeader";
import { AnalyticsDemo } from "~/demos/analytics/AnalyticsDemo";
import { getDemo } from "~/demos/registry";

export const meta = () => [{ title: `${getDemo("analytics").title} · Mantine demos` }];

export default function AnalyticsDemoRoute() {
  return (
    <Container size="lg" py="md">
      <DemoHeader slug="analytics" />
      <AnalyticsDemo />
    </Container>
  );
}
