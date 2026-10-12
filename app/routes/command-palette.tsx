import { Container } from "@mantine/core";

import { DemoHeader } from "~/components/DemoHeader";
import { CommandPaletteDemo } from "~/demos/command-palette/CommandPaletteDemo";
import { getDemo } from "~/demos/registry";

export const meta = () => [{ title: `${getDemo("command-palette").title} · Mantine demos` }];

export default function CommandPaletteDemoRoute() {
  return (
    <Container size="lg" py="md">
      <DemoHeader slug="command-palette" />
      <CommandPaletteDemo />
    </Container>
  );
}
