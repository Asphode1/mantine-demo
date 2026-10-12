import { Box, PasswordInput, type PasswordInputProps, Progress, Stack, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

import { MIN_PASSWORD_LENGTH, passwordRequirements, passwordStrength } from "./data";

export function PasswordField(props: PasswordInputProps & { value: string }) {
  const strength = passwordStrength(props.value);
  const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";

  const checks = [
    { label: `At least ${MIN_PASSWORD_LENGTH} characters`, met: props.value.length >= MIN_PASSWORD_LENGTH },
    ...passwordRequirements.map((r) => ({ label: r.label, met: r.re.test(props.value) })),
  ];

  return (
    <Box>
      <PasswordInput {...props} />
      <Progress value={strength} color={color} size={5} mt="xs" aria-label="Password strength" />
      <Stack gap={2} mt="xs">
        {checks.map((check) => (
          <Text
            key={check.label}
            size="xs"
            c={check.met ? "teal" : "dimmed"}
            display="flex"
            style={{ alignItems: "center", gap: 6 }}
          >
            {check.met ? <IconCheck size={12} /> : <IconX size={12} />}
            {check.label}
          </Text>
        ))}
      </Stack>
    </Box>
  );
}
