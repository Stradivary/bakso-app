import {
  Button,
  Card,
  Indicator,
  Popover,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import dayjs from "dayjs";
import { Bell } from "lucide-react";
import { useCallback } from "react";
import { useAuth } from "../contexts/useAuth";
import { useNotifications } from "../hooks/useNotification";
import { NearbyUser } from "../models/user.types";

export function NotificationCenter({ users }: { users: NearbyUser[]; }) {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications(user?.id);
  const [opened, { toggle }] = useDisclosure();

  const handleNotificationClick = useCallback(async (notificationId: string) => {
    await markAsRead(notificationId);
  }, [markAsRead]);

  return (
    <Popover
      opened={opened}
      position="bottom-end"
      shadow="md"
    >
      <Popover.Target>
        <Indicator disabled={unreadCount === 0} processing
          size={12} >
          <Button
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
          <Text fw={500}>Notifikasi</Text>
          <ScrollArea style={{ height: 300 }}>
            <Stack gap="xs">
              {notifications.length === 0 ? (
                <Text c="dimmed" ta="center">
                  Tidak ada notifikasi
                </Text>
              ) : (
                notifications.map((notification) => {
                  const buyer = users?.find((u) => u.id === notification.buyer_id);
                  return (
                    <Card
                      key={notification.id}
                      p="xs"
                      withBorder
                      onClick={() => handleNotificationClick(notification.id)}
                      style={{
                        backgroundColor: notification.is_read ? undefined : '#f0f9ff',
                        cursor: 'pointer'
                      }}
                    >
                      <Text size="sm">
                        Seorang pelanggan mencolekmu: {buyer?.name ?? 'Unknown User'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {notification.expiry_at
                          ? dayjs(notification.expiry_at).format("DD MMMM YYYY\n HH:mm")
                          : 'No date'}
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