import { Container } from "@mantine/core";

import { DemoHeader } from "~/components/DemoHeader";
import { CodeEditorDemo } from "~/demos/code-editor/CodeEditorDemo";
import { getDemo } from "~/demos/registry";

export const meta = () => [{ title: `${getDemo("code-editor").title} · Mantine demos` }];

export default function CodeEditorDemoRoute() {
  return (
    <Container size="lg" py="md">
      <DemoHeader slug="code-editor" />
      <CodeEditorDemo />
    </Container>
  );
}
