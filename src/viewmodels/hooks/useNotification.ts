import { Notification } from "@/models/Notification.types";
import { useCallback, useState } from "react";

export function useNotifications(
  userId: string | null | undefined,
  initialNotifications: Notification[] = [],
) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications); // Use initialNotifications
  const [unreadCount, setUnreadCount] = useState(
    initialNotifications.filter((note) => !note.is_read).length,
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!userId) return;

      try {
        // Optimistically update the UI
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error in markAsRead:", error);
      }
    },
    [userId],
  );

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    addNotification, // Expose addNotification to add new notifications
  };
}
