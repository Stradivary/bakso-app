import {
  ActionIcon,
  Button,
  Card,
  Indicator,
  Popover,
  ScrollArea,
  Stack,
  Text,
  Group,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import { Bell, CheckCheck } from "lucide-react";
import { useCallback } from "react";
import { Notification } from "../hooks/useNotification";

export function NotificationCenter({
  notifications,
}: Readonly<{ notifications?: Notification[] }>) {
  const [opened, { toggle }] = useDisclosure();

  const handleNotificationClick = useCallback(
    async (notificationId: string) => {
      const notification = notifications?.find(
        (note) => note.id === notificationId,
      );
      if (!notification) return;
      notification.is_read = true;
    },
    [notifications],
  );

  const handleClearNotifications = useCallback(() => {
    notifications?.forEach((note) => (note.is_read = true));
  }, [notifications]);

  return (
    <Popover opened={opened} position="bottom-end" shadow="md">
      <Popover.Target>
        <Indicator
          disabled={notifications?.filter((note) => !note.is_read).length === 0}
          processing
          size={12}
        >
          <Button
            data-testid="notification-center"
            variant="white"
            size="compact-lg"
            onClick={() => toggle()}
          >
            <Bell size={24} />
          </Button>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown w={250} style={{ zIndex: 800 }}>
        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Text fw={500}>Notifikasi</Text>
            <ActionIcon
              variant="transparent"
              size="xs"
              onClick={() => handleClearNotifications()}
            >
              <CheckCheck size={20} />
            </ActionIcon>
          </Group>
          <ScrollArea style={{ height: 300 }}>
            <Stack gap="xs">
              {notifications?.length === 0 ? (
                <Text c="dimmed" ta="center">
                  Tidak ada notifikasi
                </Text>
              ) : (
                notifications?.map((notification) => {
                  return (
                    <Card
                      key={notification.id}
                      p="xs"
                      withBorder
                      onClick={() => handleNotificationClick(notification.id)}
                      style={{
                        backgroundColor: notification.is_read
                          ? undefined
                          : "#f0f9ff",
                        cursor: "pointer",
                      }}
                    >
                      <Text size="sm">
                        Seorang pelanggan mencolekmu:{" "}
                        {notification.buyer_name ?? "Unknown User"}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {notification.expiry_at
                          ? dayjs(notification.expiry_at).format(
                              "DD MMMM YYYY\n HH:mm",
                            )
                          : "No date"}
                      </Text>
                    </Card>
                  );
                })
              )}
            </Stack>
          </ScrollArea>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
