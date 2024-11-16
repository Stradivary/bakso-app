import { useCallback, useState } from "react";

export interface Notification {
  buyer_id: string | null;
  created_at: string | null;
  expiry_at: string | null;
  id: string;
  seller_id: string | null;
  is_read: boolean | null;
  buyer_name?: string;
}

export function useNotifications(
  userId: string | null | undefined,
  initialNotifications: Notification[] = [],
) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications); // Use initialNotifications
  const [unreadCount, setUnreadCount] = useState(
    initialNotifications.filter(note => !note.is_read).length
  );

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      // Optimistically update the UI
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error in markAsRead:", error);
    }
  }, [userId]);

  return {
    notifications,
    unreadCount,
    markAsRead,
  };
}