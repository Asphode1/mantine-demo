import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { hasLength, isEmail, isInRange, isNotEmpty, useForm } from "@mantine/form";

import { roles, statuses } from "./mock";
import type { Row, Status } from "./types";

type EditRowModalProps = {
  row: Row | null;
  onClose: () => void;
  onSave: (row: Row) => void;
};

export function EditRowModal({ row, onClose, onSave }: EditRowModalProps) {
  return (
    <Modal opened={row !== null} onClose={onClose} title="Edit user">
      {/* Keyed by id so the form re-initialises for each row. */}
      {row && <EditRowForm key={row.id} row={row} onCancel={onClose} onSave={onSave} />}
    </Modal>
  );
}

type FormValues = Pick<Row, "name" | "email" | "role" | "status" | "amount">;

function EditRowForm({
  row,
  onCancel,
  onSave,
}: {
  row: Row;
  onCancel: () => void;
  onSave: (row: Row) => void;
}) {
  const form = useForm<FormValues>({
    mode: "uncontrolled",
    initialValues: {
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      amount: row.amount,
    },
    validate: {
      name: hasLength({ min: 2, max: 60 }, "Name must be 2–60 characters"),
      email: isEmail("Enter a valid email address"),
      role: isNotEmpty("Pick a role"),
      amount: isInRange({ min: 0, max: 1_000_000 }, "Amount must be between 0 and 1,000,000"),
    },
    validateInputOnBlur: true,
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSave({ ...row, ...values }))}>
      <Stack>
        <TextInput
          label="Name"
          withAsterisk
          key={form.key("name")}
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Email"
          withAsterisk
          key={form.key("email")}
          {...form.getInputProps("email")}
        />
        <Group grow>
          <Select
            label="Role"
            data={roles}
            allowDeselect={false}
            key={form.key("role")}
            {...form.getInputProps("role")}
          />
          <Select
            label="Status"
            data={statuses.map((s: Status) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
            allowDeselect={false}
            key={form.key("status")}
            {...form.getInputProps("status")}
          />
        </Group>
        <NumberInput
          label="Amount"
          prefix="$"
          decimalScale={2}
          thousandSeparator=","
          min={0}
          key={form.key("amount")}
          {...form.getInputProps("amount")}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </Group>
      </Stack>
    </form>
  );
}
