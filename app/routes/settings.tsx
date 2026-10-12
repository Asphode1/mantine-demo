import { Container } from "@mantine/core";

import { DemoHeader } from "~/components/DemoHeader";
import { SettingsDemo } from "~/demos/settings/SettingsDemo";
import { getDemo } from "~/demos/registry";

export const meta = () => [{ title: `${getDemo("settings").title} · Mantine demos` }];

export default function SettingsDemoRoute() {
  return (
    <Container size="lg" py="md">
      <DemoHeader slug="settings" />
      <SettingsDemo />
    </Container>
  );
}
