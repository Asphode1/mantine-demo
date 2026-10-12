import { ActionIcon, Card, Group, Progress, Text, ThemeIcon, Tooltip } from "@mantine/core";
import {
  IconCheck,
  IconFile,
  IconFileTypePdf,
  IconPhoto,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";

import { formatBytes, type UploadItem } from "./upload";

const statusColor = { uploading: "blue", done: "teal", error: "red" } as const;

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("image/")) return <IconPhoto size={18} />;
  if (type === "application/pdf") return <IconFileTypePdf size={18} />;
  return <IconFile size={18} />;
}

type FileCardProps = {
  item: UploadItem;
  onRemove: () => void;
  onRetry: () => void;
};

export function FileCard({ item, onRemove, onRetry }: FileCardProps) {
  const color = statusColor[item.status];
  const statusText =
    item.status === "uploading"
      ? `Uploading… ${Math.round(item.progress)}%`
      : item.status === "done"
        ? "Uploaded"
        : `Failed at ${Math.round(item.progress)}% — network error`;

  return (
    <Card withBorder padding="sm">
      <Group wrap="nowrap" gap="sm">
        <ThemeIcon variant="light" color={color} size="lg">
          {item.status === "done" ? <IconCheck size={18} /> : <FileIcon type={item.type} />}
        </ThemeIcon>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <Text size="sm" fw={500} truncate>
              {item.name}
            </Text>
            <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
              {formatBytes(item.size)}
            </Text>
          </Group>
          <Progress
            value={item.progress}
            color={color}
            size="sm"
            mt={6}
            striped={item.status === "uploading"}
            animated={item.status === "uploading"}
            aria-label={`${item.name} upload progress`}
          />
          <Text size="xs" c={item.status === "error" ? "red" : "dimmed"} mt={4}>
            {statusText}
            {item.attempts > 1 && ` · attempt ${item.attempts}`}
          </Text>
        </div>
        <Group gap={4} wrap="nowrap">
          {item.status === "error" && (
            <Tooltip label="Retry">
              <ActionIcon variant="subtle" color="blue" onClick={onRetry} aria-label="Retry upload">
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label={item.status === "uploading" ? "Cancel" : "Remove"}>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={onRemove}
              aria-label={item.status === "uploading" ? "Cancel upload" : "Remove file"}
            >
              <IconX size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
}
