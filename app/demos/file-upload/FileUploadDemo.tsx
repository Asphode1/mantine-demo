import { Button, Group, Paper, Progress, Stack, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE, MIME_TYPES } from "@mantine/dropzone";
import { useInterval } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCloudUpload, IconUpload, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { FileCard } from "./FileCard";
import {
  advanceUpload,
  createUpload,
  formatBytes,
  MAX_FILE_SIZE,
  MAX_FILES,
  retryUpload,
  type UploadItem,
} from "./upload";

const ACCEPT = [...IMAGE_MIME_TYPE, MIME_TYPES.pdf, MIME_TYPES.zip, MIME_TYPES.csv];

export function FileUploadDemo() {
  const [items, setItems] = useState<UploadItem[]>([]);

  const tick = useInterval(() => {
    const next = items.map(advanceUpload);
    next.forEach((item, index) => {
      const previous = items[index];
      if (previous.status === item.status) return;
      if (item.status === "done") {
        notifications.show({ color: "teal", title: "Upload complete", message: item.name });
      } else if (item.status === "error") {
        notifications.show({
          color: "red",
          title: "Upload failed",
          message: `${item.name} — use retry to try again.`,
        });
      }
    });
    setItems(next);
  }, 250);

  // Run the simulated uploader only while something is in flight.
  const anyUploading = items.some((item) => item.status === "uploading");
  useEffect(() => {
    if (anyUploading) tick.start();
    else tick.stop();
  }, [anyUploading]);

  const addFiles = (files: File[]) => {
    const room = MAX_FILES - items.length;
    const accepted = files.slice(0, room);
    if (files.length > room) {
      notifications.show({
        color: "yellow",
        title: "Too many files",
        message: `Only ${MAX_FILES} files allowed; ${files.length - room} skipped.`,
      });
    }
    if (accepted.length === 0) return;
    setItems((current) => [...current, ...accepted.map(createUpload)]);
    notifications.show({
      title: "Uploading",
      message: `${accepted.length} ${accepted.length === 1 ? "file" : "files"} queued.`,
    });
  };

  const remove = (item: UploadItem) => {
    setItems((current) => current.filter((i) => i.id !== item.id));
    notifications.show({
      title: item.status === "uploading" ? "Upload cancelled" : "File removed",
      message: item.name,
    });
  };

  const retry = (item: UploadItem) => {
    setItems((current) => current.map((i) => (i.id === item.id ? retryUpload(i) : i)));
    notifications.show({ title: "Retrying", message: item.name });
  };

  const clearCompleted = () => {
    const count = items.filter((i) => i.status === "done").length;
    setItems((current) => current.filter((i) => i.status !== "done"));
    notifications.show({ title: "Cleared", message: `${count} completed uploads removed.` });
  };

  const doneCount = items.filter((i) => i.status === "done").length;
  const errorCount = items.filter((i) => i.status === "error").length;
  const overall =
    items.length === 0 ? 0 : items.reduce((sum, i) => sum + i.progress, 0) / items.length;

  return (
    <Stack maw={720}>
      <Dropzone
        onDrop={addFiles}
        onReject={(rejections) =>
          notifications.show({
            color: "red",
            title: `${rejections.length} ${rejections.length === 1 ? "file" : "files"} rejected`,
            message: rejections
              .map((r) => `${r.file.name}: ${r.errors.map((e) => e.message).join(", ")}`)
              .join("\n"),
          })
        }
        maxSize={MAX_FILE_SIZE}
        accept={ACCEPT}
        disabled={items.length >= MAX_FILES}
      >
        <Group justify="center" gap="xl" mih={160} style={{ pointerEvents: "none" }}>
          <Dropzone.Accept>
            <IconUpload size={48} stroke={1.5} color="var(--mantine-color-blue-6)" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={48} stroke={1.5} color="var(--mantine-color-red-6)" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconCloudUpload size={48} stroke={1.5} color="var(--mantine-color-dimmed)" />
          </Dropzone.Idle>
          <div>
            <Text size="lg" fw={500}>
              Drag files here or click to browse
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Images, PDF, ZIP or CSV · up to {formatBytes(MAX_FILE_SIZE)} each · max{" "}
              {MAX_FILES} files
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              About a quarter of first attempts fail on purpose so you can try retry.
            </Text>
          </div>
        </Group>
      </Dropzone>

      {items.length > 0 && (
        <Paper withBorder p="sm">
          <Group justify="space-between" mb={6}>
            <Text size="sm">
              {doneCount} of {items.length} uploaded
              {errorCount > 0 && (
                <Text span c="red">
                  {" "}
                  · {errorCount} failed
                </Text>
              )}
            </Text>
            <Button size="xs" variant="subtle" onClick={clearCompleted} disabled={doneCount === 0}>
              Clear completed
            </Button>
          </Group>
          <Progress value={overall} size="xs" aria-label="Overall progress" />
        </Paper>
      )}

      <Stack gap="xs">
        {items.map((item) => (
          <FileCard
            key={item.id}
            item={item}
            onRemove={() => remove(item)}
            onRetry={() => retry(item)}
          />
        ))}
      </Stack>
    </Stack>
  );
}
