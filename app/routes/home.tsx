import {
  Badge,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "react-router";

import { demos } from "~/demos/registry";

export const meta = () => [{ title: "Mantine demos" }];

export default function Home() {
  return (
    <Container size="lg" py="md">
      <Stack gap={4} mb="xl">
        <Title order={1}>Mantine demos</Title>
        <Text c="dimmed">
          Ten mid-complexity product features, each built only from official
          @mantine packages.
        </Text>
      </Stack>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {demos.map((demo) => (
          <Card
            key={demo.slug}
            component={Link}
            to={`/${demo.slug}`}
            withBorder
            padding="lg"
          >
            <Group justify="space-between" mb="xs">
              <Text fw={600}>{demo.title}</Text>
              <Badge variant="light">#{demo.number}</Badge>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              {demo.description}
            </Text>
            <Group gap={4} mt="auto">
              {demo.packages
                .filter((p) => !["core", "hooks"].includes(p))
                .map((pkg) => (
                  <Badge key={pkg} size="xs" variant="outline" color="gray" tt="none">
                    {pkg}
                  </Badge>
                ))}
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </Container>
  );
}
