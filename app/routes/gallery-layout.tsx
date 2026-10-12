import {
  Anchor,
  AppShell,
  Badge,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconExternalLink, IconHome } from "@tabler/icons-react";
import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";

import { ColorSchemeToggle } from "~/components/ColorSchemeToggle";
import { demos } from "~/demos/registry";

export default function GalleryLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const { pathname } = useLocation();

  // Close the mobile navbar after navigating.
  useEffect(close, [pathname]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label="Toggle navigation"
            />
            <Anchor component={Link} to="/" c="inherit" fw={700} size="lg" underline="never">
              Mantine demos
            </Anchor>
          </Group>
          <ColorSchemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component={ScrollArea}>
          <NavLink
            component={Link}
            to="/"
            label="Overview"
            leftSection={<IconHome size={16} />}
            active={pathname === "/"}
          />
          {demos.map((demo) => (
            <NavLink
              key={demo.slug}
              component={Link}
              to={`/${demo.slug}`}
              label={demo.title}
              active={pathname === `/${demo.slug}`}
              leftSection={
                <Badge size="xs" variant="light" w={28} px={0}>
                  {demo.number}
                </Badge>
              }
              rightSection={
                demo.standalone ? <IconExternalLink size={14} /> : undefined
              }
            />
          ))}
        </AppShell.Section>
        <Text size="xs" c="dimmed" p="xs">
          Built with Mantine 9 + React Router
        </Text>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
