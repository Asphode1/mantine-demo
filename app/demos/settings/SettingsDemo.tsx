import {
  Button,
  ColorInput,
  Divider,
  Grid,
  Group,
  type MantineColorScheme,
  Paper,
  RangeSlider,
  SegmentedControl,
  Slider,
  Stack,
  Switch,
  Tabs,
  Text,
  useMantineColorScheme,
  useMatches,
} from "@mantine/core";
import { useDebouncedCallback, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconAccessible,
  IconBell,
  IconPalette,
  IconRestore,
} from "@tabler/icons-react";

import {
  accentSwatches,
  defaultPreferences,
  deserializePreferences,
  type DigestFrequency,
  formatHour,
  PREFERENCES_KEY,
  type Preferences,
} from "./preferences";
import { PreferencesPreview } from "./PreferencesPreview";

export function SettingsDemo() {
  const [prefs, setPrefs] = useLocalStorage<Preferences>({
    key: PREFERENCES_KEY,
    defaultValue: defaultPreferences,
    deserialize: deserializePreferences,
  });
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const tabsOrientation = useMatches<"horizontal" | "vertical">({
    base: "horizontal",
    sm: "vertical",
  });

  // One toast per burst of edits (e.g. dragging a slider), not one per tick.
  const announceSaved = useDebouncedCallback(() => {
    notifications.show({
      id: "settings-saved",
      color: "teal",
      title: "Preferences saved",
      message: "Changes are stored on this device.",
      autoClose: 1500,
    });
  }, 600);

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((current) => ({ ...current, [key]: value }));
    announceSaved();
  };

  const reset = () => {
    setPrefs(defaultPreferences);
    setColorScheme("auto");
    notifications.show({
      title: "Defaults restored",
      message: "All preferences were reset.",
    });
  };

  return (
    <Grid gap="lg">
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Paper withBorder p="md">
          <Tabs defaultValue="appearance" orientation={tabsOrientation} variant="pills">
            <Tabs.List mb={{ base: "md", sm: 0 }} mr={{ base: 0, sm: "md" }}>
              <Tabs.Tab value="appearance" leftSection={<IconPalette size={16} />}>
                Appearance
              </Tabs.Tab>
              <Tabs.Tab value="notifications" leftSection={<IconBell size={16} />}>
                Notifications
              </Tabs.Tab>
              <Tabs.Tab value="accessibility" leftSection={<IconAccessible size={16} />}>
                Accessibility
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="appearance">
              <Stack>
                <Field label="Color scheme" description="Applies to the whole app">
                  <SegmentedControl
                    fullWidth
                    value={colorScheme}
                    onChange={(value) => {
                      setColorScheme(value as MantineColorScheme);
                      announceSaved();
                    }}
                    data={[
                      { label: "Light", value: "light" },
                      { label: "Dark", value: "dark" },
                      { label: "System", value: "auto" },
                    ]}
                  />
                </Field>
                <ColorInput
                  label="Accent color"
                  description="Used for buttons, badges and links"
                  value={prefs.accentColor}
                  onChange={(value) => update("accentColor", value)}
                  swatches={accentSwatches}
                  swatchesPerRow={10}
                  format="hex"
                />
                <Field label="Corner radius" description={`${prefs.radius}px`}>
                  <Slider
                    min={0}
                    max={24}
                    step={2}
                    value={prefs.radius}
                    onChange={(value) => update("radius", value)}
                    marks={[
                      { value: 0, label: "Sharp" },
                      { value: 12, label: "Soft" },
                      { value: 24, label: "Round" },
                    ]}
                    mb="lg"
                  />
                </Field>
                <Field label="Font size" description={`${prefs.fontSize}px`}>
                  <Slider
                    min={12}
                    max={20}
                    value={prefs.fontSize}
                    onChange={(value) => update("fontSize", value)}
                    marks={[12, 14, 16, 18, 20].map((value) => ({ value, label: value }))}
                    mb="lg"
                  />
                </Field>
                <Switch
                  label="Compact mode"
                  description="Tighter spacing and smaller controls"
                  checked={prefs.compact}
                  onChange={(event) => update("compact", event.currentTarget.checked)}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="notifications">
              <Stack>
                <Switch
                  label="Email notifications"
                  checked={prefs.emailNotifications}
                  onChange={(event) =>
                    update("emailNotifications", event.currentTarget.checked)
                  }
                />
                <Field label="Email digest" description="Summary of activity you missed">
                  <SegmentedControl
                    fullWidth
                    disabled={!prefs.emailNotifications}
                    value={prefs.digest}
                    onChange={(value) => update("digest", value as DigestFrequency)}
                    data={[
                      { label: "Daily", value: "daily" },
                      { label: "Weekly", value: "weekly" },
                      { label: "Never", value: "never" },
                    ]}
                  />
                </Field>
                <Switch
                  label="Push notifications"
                  checked={prefs.pushNotifications}
                  onChange={(event) =>
                    update("pushNotifications", event.currentTarget.checked)
                  }
                />
                <Switch
                  label="Only notify me about mentions"
                  checked={prefs.mentionsOnly}
                  onChange={(event) => update("mentionsOnly", event.currentTarget.checked)}
                />
                <Field
                  label="Delivery window"
                  description={`Between ${formatHour(prefs.deliveryHours[0])} and ${formatHour(prefs.deliveryHours[1])}`}
                >
                  <RangeSlider
                    min={0}
                    max={24}
                    minRange={1}
                    value={prefs.deliveryHours}
                    onChange={(value) => update("deliveryHours", value)}
                    label={formatHour}
                    marks={[0, 6, 12, 18, 24].map((value) => ({
                      value,
                      label: formatHour(value),
                    }))}
                    mb="lg"
                  />
                </Field>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="accessibility">
              <Stack>
                <Switch
                  label="Reduce motion"
                  description="Disable transitions in the preview"
                  checked={prefs.reduceMotion}
                  onChange={(event) => update("reduceMotion", event.currentTarget.checked)}
                />
                <Switch
                  label="Always underline links"
                  checked={prefs.underlineLinks}
                  onChange={(event) => update("underlineLinks", event.currentTarget.checked)}
                />
                <Switch
                  label="High contrast"
                  description="Stronger text color and borders"
                  checked={prefs.highContrast}
                  onChange={(event) => update("highContrast", event.currentTarget.checked)}
                />
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 5 }}>
        <Stack style={{ position: "sticky", top: 76 }}>
          <PreferencesPreview prefs={prefs} />
          <Divider />
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Saved to localStorage · persists across reloads
            </Text>
            <Button
              variant="default"
              size="xs"
              leftSection={<IconRestore size={14} />}
              onClick={reset}
            >
              Reset to defaults
            </Button>
          </Group>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Text size="sm" fw={500}>
        {label}
      </Text>
      {description && (
        <Text size="xs" c="dimmed" mb={6}>
          {description}
        </Text>
      )}
      {children}
    </div>
  );
}
