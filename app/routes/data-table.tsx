import { Container } from "@mantine/core";

import { DemoHeader } from "~/components/DemoHeader";
import { DataTableDemo } from "~/demos/data-table/DataTableDemo";
import { getDemo } from "~/demos/registry";

export const meta = () => [{ title: `${getDemo("data-table").title} · Mantine demos` }];

export default function DataTableDemoRoute() {
  return (
    <Container size="lg" py="md">
      <DemoHeader slug="data-table" />
      <DataTableDemo />
    </Container>
  );
}
