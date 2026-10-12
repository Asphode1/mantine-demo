import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { getHotkeyHandler, useScrollIntoView } from "@mantine/hooks";
import { IconArrowDown, IconSend, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { MessageBubble } from "./MessageBubble";
import {
  botReply,
  createMessage,
  initialMessages,
  type Message,
  participants,
  typingDelay,
} from "./messages";

const NEAR_BOTTOM_PX = 48;

export function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [unseen, setUnseen] = useState(0);
  const replyTimer = useRef<number | null>(null);

  const { scrollableRef, targetRef, scrollIntoView } = useScrollIntoView<
    HTMLDivElement,
    HTMLDivElement
  >({ duration: 250 });

  // Follow new content only when the reader is already at the bottom.
  useEffect(() => {
    if (atBottom) scrollIntoView({ alignment: "end" });
    else setUnseen((count) => count + 1);
  }, [messages.length]);

  useEffect(() => {
    if (typing && atBottom) scrollIntoView({ alignment: "end" });
  }, [typing]);

  useEffect(() => () => {
    if (replyTimer.current) window.clearTimeout(replyTimer.current);
  }, []);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, createMessage("me", text)]);
    setDraft("");
    setAtBottom(true);
    setUnseen(0);

    const reply = botReply(text);
    setTyping(true);
    if (replyTimer.current) window.clearTimeout(replyTimer.current);
    replyTimer.current = window.setTimeout(() => {
      setTyping(false);
      setMessages((current) => [...current, createMessage("bot", reply)]);
    }, typingDelay(reply));
  };

  const clear = () => {
    if (replyTimer.current) window.clearTimeout(replyTimer.current);
    setTyping(false);
    setMessages([createMessage("bot", "Conversation cleared. What's next?")]);
  };

  const jumpToLatest = () => {
    setAtBottom(true);
    setUnseen(0);
    scrollIntoView({ alignment: "end" });
  };

  return (
    <Paper withBorder maw={720} style={{ display: "flex", flexDirection: "column", height: 560 }}>
      <Group justify="space-between" px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
        <Group gap="sm">
          <Avatar color={participants.bot.color} radius="xl">
            {participants.bot.initials}
          </Avatar>
          <div>
            <Text fw={600} size="sm">
              {participants.bot.name}
            </Text>
            <Text size="xs" c={typing ? "teal" : "dimmed"}>
              {typing ? "typing…" : "online"}
            </Text>
          </div>
        </Group>
        <Tooltip label="Clear conversation">
          <ActionIcon variant="subtle" color="gray" onClick={clear} aria-label="Clear conversation">
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Box pos="relative" style={{ flex: 1, minHeight: 0 }}>
        <ScrollArea
          h="100%"
          viewportRef={scrollableRef}
          onScrollPositionChange={({ y }) => {
            const viewport = scrollableRef.current;
            if (!viewport) return;
            const bottom = viewport.scrollHeight - viewport.clientHeight - y <= NEAR_BOTTOM_PX;
            setAtBottom(bottom);
            if (bottom) setUnseen(0);
          }}
        >
          <Stack gap="sm" p="md" role="log" aria-live="polite">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {typing && (
              <Group gap="xs" align="center">
                <Avatar color={participants.bot.color} radius="xl" size="sm">
                  {participants.bot.initials}
                </Avatar>
                <Paper px="sm" py={8} radius="lg" bg="var(--mantine-color-default-hover)">
                  <Loader type="dots" size="sm" color="gray" aria-label="Bot is typing" />
                </Paper>
              </Group>
            )}
            <div ref={targetRef} />
          </Stack>
        </ScrollArea>

        {!atBottom && (
          <Button
            size="compact-sm"
            radius="xl"
            leftSection={<IconArrowDown size={14} />}
            onClick={jumpToLatest}
            pos="absolute"
            bottom={12}
            left="50%"
            style={{ transform: "translateX(-50%)" }}
          >
            {unseen > 0 ? `${unseen} new` : "Latest"}
          </Button>
        )}
      </Box>

      <Group
        p="sm"
        gap="xs"
        align="flex-end"
        wrap="nowrap"
        style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
      >
        <Textarea
          placeholder="Write a message…  (Enter to send, Shift+Enter for a new line)"
          autosize
          minRows={1}
          maxRows={5}
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={getHotkeyHandler([["Enter", send]])}
          style={{ flex: 1 }}
          aria-label="Message"
        />
        <ActionIcon
          size={36}
          onClick={send}
          disabled={!draft.trim()}
          aria-label="Send message"
        >
          <IconSend size={18} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
