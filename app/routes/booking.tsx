import { Container } from "@mantine/core";

import { DemoHeader } from "~/components/DemoHeader";
import { BookingDemo } from "~/demos/booking/BookingDemo";
import { getDemo } from "~/demos/registry";

export const meta = () => [{ title: `${getDemo("booking").title} · Mantine demos` }];

export default function BookingDemoRoute() {
  return (
    <Container size="lg" py="md">
      <DemoHeader slug="booking" />
      <BookingDemo />
    </Container>
  );
}
