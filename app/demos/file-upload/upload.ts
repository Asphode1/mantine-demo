export type UploadStatus = "uploading" | "done" | "error";

export type UploadItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: UploadStatus;
  /** Progress (0–100) at which this attempt will fail, if it is doomed to. */
  failAt: number | null;
  attempts: number;
};

export const MAX_FILE_SIZE = 5 * 1024 ** 2;
export const MAX_FILES = 10;
/** Share of first attempts that fail, so retry is always demonstrable. */
const FAILURE_RATE = 0.25;

let counter = 0;

export function createUpload(file: File): UploadItem {
  counter += 1;
  return {
    id: `upload-${Date.now()}-${counter}`,
    name: file.name,
    size: file.size,
    type: file.type,
    progress: 0,
    status: "uploading",
    failAt: Math.random() < FAILURE_RATE ? 30 + Math.round(Math.random() * 50) : null,
    attempts: 1,
  };
}

export function retryUpload(item: UploadItem): UploadItem {
  // Retries always succeed.
  return { ...item, progress: 0, status: "uploading", failAt: null, attempts: item.attempts + 1 };
}

/**
 * Advances one simulated tick. Larger files move more slowly.
 * Returns the next item, unchanged when it is not uploading.
 */
export function advanceUpload(item: UploadItem): UploadItem {
  if (item.status !== "uploading") return item;

  const sizeFactor = Math.max(0.25, 1 - item.size / MAX_FILE_SIZE);
  const progress = Math.min(100, item.progress + (6 + Math.random() * 14) * sizeFactor);

  if (item.failAt !== null && progress >= item.failAt) {
    return { ...item, progress: item.failAt, status: "error" };
  }
  return { ...item, progress, status: progress >= 100 ? "done" : "uploading" };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
