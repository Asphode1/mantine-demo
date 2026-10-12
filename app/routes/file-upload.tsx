import { Container } from "@mantine/core";

import { DemoHeader } from "~/components/DemoHeader";
import { FileUploadDemo } from "~/demos/file-upload/FileUploadDemo";
import { getDemo } from "~/demos/registry";

export const meta = () => [{ title: `${getDemo("file-upload").title} · Mantine demos` }];

export default function FileUploadDemoRoute() {
  return (
    <Container size="lg" py="md">
      <DemoHeader slug="file-upload" />
      <FileUploadDemo />
    </Container>
  );
}
