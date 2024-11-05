import { useEffect, useState, useCallback } from "react";
import { pokeService } from "../services/pokeService";
import { supabase } from "../services/supabaseService";

interface Notification {
  buyer_id: string | null;
  created_at: string | null;
  expiry_at: string | null;
  id: string;
  seller_id: string | null;
  is_read: boolean | null;
}

export function useNotifications(
  userId: string | null | undefined,
  pokeServiceInstance = pokeService,
  supabaseClient = supabase,
) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      console.log("Loading notifications for user:", userId);
      const data = await pokeServiceInstance.getPokesBySellerId(userId);
      console.log("Loaded notifications:", data);
      setNotifications(data);
      const unreadCount = data.filter(note => !note.is_read).length;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }, [userId, pokeServiceInstance]);

  useEffect(() => {
    if (!userId) return;

    // Initial load
    loadNotifications();

    // Set up real-time subscription
    console.log("Setting up subscription for user:", userId);
    const channel = supabaseClient.channel(`public:pokes:${userId}`);

    const subscription = channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pokes",
          filter: `seller_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Received notification change:", payload);

          // Reload all notifications to ensure consistency
          loadNotifications();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up subscription");
      subscription.unsubscribe();
    };
  }, [userId, supabaseClient, loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      console.log("Marking notification as read:", notificationId);
      const { error } = await supabaseClient
        .from("pokes")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        return;
      }

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
  }, [userId, supabaseClient]);

  return {
    notifications,
    unreadCount,
    markAsRead,
  };
}