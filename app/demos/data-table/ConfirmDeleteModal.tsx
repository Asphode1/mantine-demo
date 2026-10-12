import { Button, Group, Modal, Text } from "@mantine/core";

type ConfirmDeleteModalProps = {
  /** Names of the rows about to be deleted; empty closes the modal. */
  names: string[];
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteModal({ names, onCancel, onConfirm }: ConfirmDeleteModalProps) {
  const subject = names.length === 1 ? names[0] : `${names.length} users`;

  return (
    <Modal opened={names.length > 0} onClose={onCancel} title="Delete user" centered>
      <Text size="sm">
        Delete <b>{subject}</b>? This cannot be undone.
      </Text>
      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button color="red" onClick={onConfirm} data-autofocus>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
