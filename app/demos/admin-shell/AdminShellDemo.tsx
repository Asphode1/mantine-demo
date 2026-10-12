import {
  ActionIcon,
  Anchor,
  AppShell,
  Avatar,
  Badge,
  Breadcrumbs,
  Burger,
  Button,
  em,
  Group,
  Kbd,
  Menu,
  NavLink,
  Paper,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconChevronDown,
  IconLogout,
  IconMoon,
  IconSearch,
  IconSettings,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { navigation, resolvePage, toHref } from "./nav";

const badges: Record<string, number> = { "orders/pending": 12, "orders/refunds": 3 };

export function AdminShellDemo() {
  const splat = useParams()["*"] ?? "";
  const page = resolvePage(splat);
  const navigate = useNavigate();

  const isMobile = useMediaQuery(`(max-width: ${em(767)})`);
  const [mobileOpened, mobile] = useDisclosure(false);
  const [desktopOpened, desktop] = useDisclosure(true);

  const { setColorScheme } = useMantineColorScheme();
  const computedScheme = useComputedColorScheme("light");

  // Mobile navbar is an overlay; close it whenever the page changes.
  useEffect(() => mobile.close(), [splat]);

  const navbarOpened = isMobile ? mobileOpened : desktopOpened;
  const toggleNavbar = isMobile ? mobile.toggle : desktop.toggle;

  const notify = (title: string, message: string) => notifications.show({ title, message });

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              opened={navbarOpened}
              onClick={toggleNavbar}
              size="sm"
              aria-label={navbarOpened ? "Collapse navigation" : "Expand navigation"}
            />
            <Text fw={800} size="lg">
              Shopline
              <Text span c="dimmed" fw={400} size="sm" ml={6}>
                admin
              </Text>
            </Text>
          </Group>

          <Group gap="sm" wrap="nowrap">
            {isMobile ? (
              <ActionIcon
                variant="default"
                size="lg"
                aria-label="Search"
                onClick={() => notify("Search", "Search would open full-screen on mobile.")}
              >
                <IconSearch size={18} />
              </ActionIcon>
            ) : (
              <TextInput
                placeholder="Search orders, products…"
                leftSection={<IconSearch size={16} />}
                rightSection={<Kbd size="xs">/</Kbd>}
                w={280}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    notify("Search", `No results for “${event.currentTarget.value}” in this demo.`);
                  }
                }}
              />
            )}

            <Menu position="bottom-end" width={220} withinPortal>
              <Menu.Target>
                <UnstyledButton aria-label="Account menu">
                  <Group gap={8} wrap="nowrap">
                    <Avatar color="indigo" radius="xl" size={32}>
                      GH
                    </Avatar>
                    {!isMobile && (
                      <>
                        <div>
                          <Text size="sm" fw={500} lh={1.2}>
                            Grace Hopper
                          </Text>
                          <Text size="xs" c="dimmed" lh={1.2}>
                            Owner
                          </Text>
                        </div>
                        <IconChevronDown size={14} />
                      </>
                    )}
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>grace@shopline.dev</Menu.Label>
                <Menu.Item
                  leftSection={<IconUser size={14} />}
                  onClick={() => notify("Profile", "Profile page is not part of this demo.")}
                >
                  Profile
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconSettings size={14} />}
                  onClick={() => navigate(toHref("settings"))}
                >
                  Account settings
                </Menu.Item>
                <Menu.Item
                  leftSection={
                    computedScheme === "dark" ? <IconSun size={14} /> : <IconMoon size={14} />
                  }
                  onClick={() => {
                    const next = computedScheme === "dark" ? "light" : "dark";
                    setColorScheme(next);
                    notify("Theme", `Switched to ${next} mode.`);
                  }}
                >
                  {computedScheme === "dark" ? "Light mode" : "Dark mode"}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item component={Link} to="/" leftSection={<IconArrowLeft size={14} />}>
                  Back to gallery
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
                  onClick={() =>
                    notifications.show({
                      color: "red",
                      title: "Signed out",
                      message: "Just kidding — this is a demo.",
                    })
                  }
                >
                  Log out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component={ScrollArea}>
          {navigation.map((section) =>
            section.children ? (
              <NavLink
                key={section.label}
                label={section.label}
                leftSection={section.icon}
                childrenOffset={28}
                defaultOpened={page?.section === section}
              >
                {section.children.map((leaf) => (
                  <NavLink
                    key={leaf.path}
                    component={Link}
                    to={toHref(leaf.path)}
                    label={leaf.label}
                    active={page?.leaf === leaf}
                    rightSection={
                      badges[leaf.path] ? (
                        <Badge size="xs" variant="filled" circle>
                          {badges[leaf.path]}
                        </Badge>
                      ) : undefined
                    }
                  />
                ))}
              </NavLink>
            ) : (
              <NavLink
                key={section.label}
                component={Link}
                to={toHref(section.path ?? "")}
                label={section.label}
                leftSection={section.icon}
                active={page?.section === section && !page.leaf}
              />
            ),
          )}
        </AppShell.Section>
        <AppShell.Section>
          <NavLink
            component={Link}
            to="/"
            label="Back to gallery"
            leftSection={<IconArrowLeft size={18} stroke={1.5} />}
          />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {page ? (
          <Stack>
            <Breadcrumbs>
              <Anchor component={Link} to={toHref("")} size="sm">
                Admin
              </Anchor>
              {page.title !== "Dashboard" && (
                <Anchor
                  component={Link}
                  to={toHref(page.section.children?.[0].path ?? page.section.path ?? "")}
                  size="sm"
                >
                  {page.section.label}
                </Anchor>
              )}
              {page.leaf && <Text size="sm">{page.leaf.label}</Text>}
            </Breadcrumbs>
            <Group justify="space-between">
              <div>
                <Title order={2}>{page.title}</Title>
                <Text c="dimmed">{page.description}</Text>
              </div>
              <Button
                onClick={() => notify(page.title, `“New” action on ${page.title} triggered.`)}
              >
                New
              </Button>
            </Group>
            <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }}>
              {["Today", "This week", "This month"].map((label, index) => (
                <Paper key={label} withBorder p="md">
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    {label}
                  </Text>
                  <Text fw={700} size="xl">
                    {(index + 1) * 128 + splat.length * 7}
                  </Text>
                </Paper>
              ))}
            </SimpleGrid>
            <Paper withBorder p="md">
              <Text fw={600} mb="sm">
                {page.title} content
              </Text>
              <Stack gap="xs">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} height={14} animate={false} width={`${90 - i * 9}%`} />
                ))}
              </Stack>
            </Paper>
          </Stack>
        ) : (
          <Stack align="flex-start">
            <Title order={2}>Page not found</Title>
            <Text c="dimmed">“/{splat}” is not part of the admin navigation.</Text>
            <Button component={Link} to={toHref("")} variant="light">
              Go to dashboard
            </Button>
          </Stack>
        )}
      </AppShell.Main>
    </AppShell>
  );
}
