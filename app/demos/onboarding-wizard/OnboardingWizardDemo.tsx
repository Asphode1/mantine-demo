import {
  Button,
  Chip,
  Group,
  Paper,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Stepper,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { hasLength, isEmail, matchesField, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCircleCheck } from "@tabler/icons-react";
import { useState } from "react";

import {
  initialValues,
  interestOptions,
  MAX_INTERESTS,
  type OnboardingValues,
  passwordStrength,
  planOptions,
  roleOptions,
  teamSizeOptions,
} from "./data";
import { PasswordField } from "./PasswordField";

const LAST_STEP = 3; // index of the review step; LAST_STEP + 1 is "completed"

export function OnboardingWizardDemo() {
  const [active, setActive] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<OnboardingValues>({
    initialValues,
    // Only the fields of the current step are validated.
    validate: (values) => {
      if (active === 0) {
        return {
          email: isEmail("Enter a valid email")(values.email),
          password:
            passwordStrength(values.password) < 100
              ? "Password must meet every requirement"
              : null,
          confirmPassword: matchesField("password", "Passwords do not match")(
            values.confirmPassword,
            values,
          ),
        };
      }
      if (active === 1) {
        return {
          fullName: hasLength({ min: 2 }, "Enter your name")(values.fullName),
          role: values.role ? null : "Pick a role",
          teamSize: values.teamSize ? null : "Pick a team size",
        };
      }
      if (active === 2) {
        return {
          interests:
            values.interests.length === 0
              ? "Pick at least one topic"
              : values.interests.length > MAX_INTERESTS
                ? `Pick at most ${MAX_INTERESTS} topics`
                : null,
        };
      }
      return {};
    },
  });

  const next = () => {
    if (form.validate().hasErrors) {
      notifications.show({
        color: "red",
        title: "Check this step",
        message: "Fix the highlighted fields to continue.",
      });
      return;
    }
    setActive((current) => Math.min(current + 1, LAST_STEP));
  };

  const back = () => setActive((current) => Math.max(current - 1, 0));

  const finish = () => {
    setSubmitting(true);
    // Simulated network request.
    setTimeout(() => {
      setSubmitting(false);
      setActive(LAST_STEP + 1);
      notifications.show({
        color: "teal",
        title: "Welcome aboard!",
        message: `Your ${form.values.plan} workspace is ready, ${form.values.fullName.split(" ")[0]}.`,
      });
    }, 900);
  };

  const restart = () => {
    form.reset();
    setActive(0);
    notifications.show({ title: "Wizard reset", message: "Starting over from step 1." });
  };

  const { values } = form;
  const teamSizeLabel = teamSizeOptions.find((o) => o.value === values.teamSize)?.label;
  const planLabel = planOptions.find((o) => o.value === values.plan)?.label;

  return (
    <Paper withBorder p={{ base: "md", sm: "xl" }} maw={760}>
      <Stepper
        active={active}
        onStepClick={setActive}
        allowNextStepsSelect={false}
        size="sm"
      >
        <Stepper.Step label="Account" description="Sign-in details">
          <Stack mt="lg" maw={420}>
            <TextInput
              label="Work email"
              placeholder="you@company.com"
              withAsterisk
              {...form.getInputProps("email")}
            />
            <PasswordField
              label="Password"
              withAsterisk
              {...form.getInputProps("password")}
              value={values.password}
            />
            <TextInput
              type="password"
              label="Confirm password"
              withAsterisk
              {...form.getInputProps("confirmPassword")}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Profile" description="About you">
          <Stack mt="lg" maw={420}>
            <TextInput
              label="Full name"
              placeholder="Ada Lovelace"
              withAsterisk
              {...form.getInputProps("fullName")}
            />
            <Select
              label="Role"
              placeholder="What do you do?"
              data={roleOptions}
              withAsterisk
              {...form.getInputProps("role")}
            />
            <Select
              label="Team size"
              placeholder="How big is your team?"
              data={teamSizeOptions}
              withAsterisk
              {...form.getInputProps("teamSize")}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Preferences" description="Interests and plan">
          <Stack mt="lg">
            <div>
              <Text fw={500} size="sm">
                What are you building? <Text span c="red">*</Text>
              </Text>
              <Text size="xs" c="dimmed" mb="xs">
                Pick up to {MAX_INTERESTS} topics ({values.interests.length} selected)
              </Text>
              <Chip.Group
                multiple
                value={values.interests}
                onChange={(value) => form.setFieldValue("interests", value)}
              >
                <Group gap="xs">
                  {interestOptions.map((option) => (
                    <Chip
                      key={option}
                      value={option}
                      disabled={
                        values.interests.length >= MAX_INTERESTS &&
                        !values.interests.includes(option)
                      }
                    >
                      {option}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
              {form.errors.interests && (
                <Text c="red" size="xs" mt={6}>
                  {form.errors.interests}
                </Text>
              )}
            </div>

            <Radio.Group label="Plan" {...form.getInputProps("plan")}>
              <SimpleGrid cols={{ base: 1, sm: 3 }} mt="xs">
                {planOptions.map((plan) => (
                  <Radio.Card key={plan.value} value={plan.value} p="md" radius="md">
                    <Group wrap="nowrap" align="flex-start">
                      <Radio.Indicator />
                      <div>
                        <Text fw={600} size="sm">
                          {plan.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {plan.description}
                        </Text>
                      </div>
                    </Group>
                  </Radio.Card>
                ))}
              </SimpleGrid>
            </Radio.Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Review" description="Confirm details">
          <Table mt="lg" variant="vertical" layout="fixed" withTableBorder>
            <Table.Tbody>
              <ReviewRow label="Email" value={values.email} />
              <ReviewRow label="Name" value={values.fullName} />
              <ReviewRow label="Role" value={values.role ?? ""} />
              <ReviewRow label="Team size" value={teamSizeLabel ?? ""} />
              <ReviewRow label="Interests" value={values.interests.join(", ")} />
              <ReviewRow label="Plan" value={planLabel ?? ""} />
            </Table.Tbody>
          </Table>
        </Stepper.Step>

        <Stepper.Completed>
          <Stack align="center" py="xl" gap="sm">
            <ThemeIcon size={56} radius="xl" color="teal" variant="light">
              <IconCircleCheck size={32} />
            </ThemeIcon>
            <Title order={3}>You're all set</Title>
            <Text c="dimmed" ta="center">
              We sent a confirmation to {values.email}.
            </Text>
            <Button variant="light" onClick={restart}>
              Start over
            </Button>
          </Stack>
        </Stepper.Completed>
      </Stepper>

      {active <= LAST_STEP && (
        <Group justify="space-between" mt="xl">
          <Button variant="default" onClick={back} disabled={active === 0}>
            Back
          </Button>
          {active < LAST_STEP ? (
            <Button onClick={next}>Next step</Button>
          ) : (
            <Button color="teal" onClick={finish} loading={submitting}>
              Create workspace
            </Button>
          )}
        </Group>
      )}
    </Paper>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <Table.Tr>
      <Table.Th w={160}>{label}</Table.Th>
      <Table.Td>{value}</Table.Td>
    </Table.Tr>
  );
}
