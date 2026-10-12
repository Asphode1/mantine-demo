import { Badge, Group, Stack, Text, Title } from "@mantine/core";

import { getDemo } from "~/demos/registry";

export function DemoHeader({ slug }: { slug: string }) {
  const demo = getDemo(slug);

  return (
    <Stack gap={6} mb="lg">
      <Group gap="xs">
        <Badge variant="light" radius="sm">
          #{demo.number}
        </Badge>
        <Title order={2}>{demo.title}</Title>
      </Group>
      <Text c="dimmed">{demo.description}</Text>
      <Group gap={6}>
        {demo.packages.map((pkg) => (
          <Badge key={pkg} variant="outline" color="gray" size="sm" tt="none">
            @mantine/{pkg}
          </Badge>
        ))}
      </Group>
    </Stack>
  );
}
