import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  TextInput,
  Timeline,
  Title,
  Tooltip,
} from "@mantine/core";
import { DatePicker, TimeGrid } from "@mantine/dates";
import { hasLength, useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconInfoCircle,
  IconListDetails,
  IconTrash,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";

import {
  allSlots,
  type Booking,
  BOOKING_WINDOW_DAYS,
  formatDate,
  formatRange,
  isDateExcluded,
  services,
  unavailableSlots,
} from "./availability";

export function BookingDemo() {
  const [serviceValue, setServiceValue] = useState(services[1].value);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [confirmOpened, confirm] = useDisclosure(false);

  const service = services.find((s) => s.value === serviceValue)!;
  const disabledSlots = date ? unavailableSlots(date, bookings) : [];
  const freeCount = allSlots.length - disabledSlots.length;

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { name: "", notes: "" },
    validate: { name: hasLength({ min: 2 }, "Enter your name") },
  });

  const submit = form.onSubmit(({ name, notes }) => {
    if (!date || !time) return;
    const booking: Booking = {
      id: `${date}-${time}-${Date.now()}`,
      service,
      date,
      time,
      name,
      notes,
    };
    setBookings((current) =>
      [...current, booking].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    );
    confirm.close();
    form.reset();
    setTime(null);
    notifications.show({
      color: "teal",
      icon: <IconCheck size={18} />,
      title: "Booking confirmed",
      message: `${service.label} on ${formatDate(date)} at ${formatRange(date, time, service.minutes)}`,
    });
  });

  const cancelBooking = (booking: Booking) => {
    setBookings((current) => current.filter((b) => b.id !== booking.id));
    notifications.show({
      color: "red",
      title: "Booking cancelled",
      message: `${booking.service.label} on ${formatDate(booking.date)} was released.`,
    });
  };

  // Timeline reflects how far through the flow the user is.
  const step = time ? 2 : date ? 1 : 0;

  return (
    <Grid gap="lg">
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Paper withBorder p="md">
          <Stack>
            <div>
              <Text fw={500} size="sm" mb={6}>
                Service
              </Text>
              <SegmentedControl
                fullWidth
                value={serviceValue}
                onChange={(value) => {
                  setServiceValue(value);
                  const next = services.find((s) => s.value === value)!;
                  notifications.show({
                    title: next.label,
                    message: `${next.minutes} minutes · ${next.price ? `$${next.price}` : "free"}`,
                  });
                }}
                data={services.map((s) => ({ value: s.value, label: `${s.label} · ${s.minutes}m` }))}
              />
            </div>

            <Group align="flex-start" gap="xl" wrap="wrap">
              <div>
                <Text fw={500} size="sm" mb={6}>
                  Date
                </Text>
                <DatePicker
                  value={date}
                  onChange={(value) => {
                    setDate(value);
                    setTime(null);
                  }}
                  minDate={dayjs().format("YYYY-MM-DD")}
                  maxDate={dayjs().add(BOOKING_WINDOW_DAYS, "day").format("YYYY-MM-DD")}
                  excludeDate={isDateExcluded}
                />
                <Text size="xs" c="dimmed" mt={6}>
                  Weekends and fully booked days are unavailable.
                </Text>
              </div>

              <div style={{ flex: 1, minWidth: 260 }}>
                <Text fw={500} size="sm" mb={6}>
                  Time {date && <Text span c="dimmed" size="xs">· {freeCount} slots free</Text>}
                </Text>
                {date ? (
                  freeCount > 0 ? (
                    <TimeGrid
                      data={allSlots}
                      value={time}
                      onChange={setTime}
                      disableTime={disabledSlots}
                      format="12h"
                      allowDeselect
                      simpleGridProps={{ cols: { base: 2, xs: 3 }, spacing: "xs" }}
                    />
                  ) : (
                    <Alert icon={<IconInfoCircle size={16} />} color="yellow">
                      No free slots left on this day. Try another date.
                    </Alert>
                  )
                ) : (
                  <Text size="sm" c="dimmed">
                    Pick a date to see available times.
                  </Text>
                )}
              </div>
            </Group>

            <Group justify="flex-end">
              <Button disabled={!date || !time} onClick={confirm.open}>
                Continue
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack>
          <Paper withBorder p="md">
            <Title order={5} mb="md">
              Your booking
            </Title>
            <Timeline active={step} bulletSize={26} lineWidth={2}>
              <Timeline.Item bullet={<IconListDetails size={14} />} title="Service">
                <Text size="xs" c="dimmed">
                  {service.label} · {service.minutes} min
                </Text>
              </Timeline.Item>
              <Timeline.Item bullet={<IconCalendar size={14} />} title="Date">
                <Text size="xs" c="dimmed">
                  {date ? formatDate(date) : "Not selected"}
                </Text>
              </Timeline.Item>
              <Timeline.Item bullet={<IconClock size={14} />} title="Time">
                <Text size="xs" c="dimmed">
                  {date && time ? formatRange(date, time, service.minutes) : "Not selected"}
                </Text>
              </Timeline.Item>
              <Timeline.Item bullet={<IconCheck size={14} />} title="Confirm">
                <Text size="xs" c="dimmed">
                  {service.price ? `$${service.price} due at the appointment` : "Free"}
                </Text>
              </Timeline.Item>
            </Timeline>
          </Paper>

          <Paper withBorder p="md">
            <Title order={5} mb="sm">
              Upcoming ({bookings.length})
            </Title>
            {bookings.length === 0 ? (
              <Text size="sm" c="dimmed">
                No bookings yet.
              </Text>
            ) : (
              <Stack gap="xs">
                {bookings.map((booking) => (
                  <Card key={booking.id} withBorder padding="xs">
                    <Group justify="space-between" wrap="nowrap">
                      <div>
                        <Text size="sm" fw={500}>
                          {booking.service.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {dayjs(booking.date).format("ddd, MMM D")} ·{" "}
                          {formatRange(booking.date, booking.time, booking.service.minutes)}
                        </Text>
                      </div>
                      <Tooltip label="Cancel booking">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label="Cancel booking"
                          onClick={() => cancelBooking(booking)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Grid.Col>

      <Modal opened={confirmOpened} onClose={confirm.close} title="Confirm booking" centered>
        {date && time && (
          <form onSubmit={submit}>
            <Stack>
              <Paper withBorder p="sm" bg="var(--mantine-color-default-hover)">
                <Text fw={600}>{service.label}</Text>
                <Text size="sm">{formatDate(date)}</Text>
                <Text size="sm">{formatRange(date, time, service.minutes)}</Text>
              </Paper>
              <TextInput
                label="Your name"
                withAsterisk
                data-autofocus
                key={form.key("name")}
                {...form.getInputProps("name")}
              />
              <Textarea
                label="Notes"
                placeholder="Anything we should know?"
                autosize
                minRows={2}
                key={form.key("notes")}
                {...form.getInputProps("notes")}
              />
              <Group justify="flex-end">
                <Button variant="default" onClick={confirm.close}>
                  Back
                </Button>
                <Button type="submit" color="teal">
                  Confirm booking
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </Grid>
  );
}
