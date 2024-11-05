import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

interface Seller {
  id: string;
  name: string;
  rating: number;
  distance: number;
  status: "available" | "busy" | "offline" | "in_transaction";
  queue_count: number;
}

interface PokeState {
  sellers: Seller[];
  loading: boolean;
  activePoke: {
    id: string;
    status: string;
    sellerId: string;
    sellerName: string;
  } | null;
}

export function usePoke() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const navigate = useNavigate();
  const [state, setState] = useState<PokeState>({
    sellers: [],
    loading: true,
    activePoke: null,
  });

  // Load nearby sellers
  const loadNearbySellers = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        const { data, error } = await supabase.rpc("get_available_sellers", {
          p_latitude: latitude,
          p_longitude: longitude,
          p_radius_meters: 2000, // 2km radius
        });

        if (error) throw error;

        setState((prev) => ({
          ...prev,
          sellers: data,
          loading: false,
        }));
      } catch (error) {
        console.error("Error loading sellers:", error);
        showNotification({
          title: "Error",
          message: "Failed to load nearby sellers",
          color: "red",
        });
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [supabase],
  );

  // Send poke request
  const pokeSeller = useCallback(
    async (sellerId: string, distance: number) => {
      try {
        if (!user?.id) throw new Error("User not authenticated");

        const { data, error } = await supabase.rpc("create_poke", {
          p_customer_id: user.id,
          p_seller_id: sellerId,
          p_distance_meters: distance,
        });

        if (error) throw error;

        const seller = state.sellers.find((s) => s.id === sellerId);
        setState((prev) => ({
          ...prev,
          activePoke: {
            id: data,
            status: "pending",
            sellerId,
            sellerName: seller?.name ?? "Unknown Seller",
          },
        }));

        showNotification({
          title: "Request Sent",
          message: `Waiting for ${seller?.name ?? "seller"} to respond...`,
          color: "blue",
        });
      } catch (error) {
        console.error("Error sending poke:", error);
        showNotification({
          title: "Error",
          message: "Failed to send request",
          color: "red",
        });
      }
    },
    [supabase, user, state.sellers],
  );

  // Handle seller response
  const handlePokeResponse = useCallback(
    async (pokeId: string, status: string) => {
      try {
        const { error } = await supabase.rpc("handle_poke_response", {
          p_poke_id: pokeId,
          p_status: status,
        });

        if (error) throw error;

        if (status === "accepted") {
          showNotification({
            title: "Request Accepted",
            message: "The seller has accepted your request!",
            color: "green",
          });
        }
      } catch (error) {
        console.error("Error handling poke response:", error);
        showNotification({
          title: "Error",
          message: "Failed to process response",
          color: "red",
        });
      }
    },
    [supabase],
  );

  // Subscribe to poke status changes
  useEffect(() => {
    if (!user?.id || !state.activePoke) return;

    const subscription = supabase
      .channel(`poke:${state.activePoke.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "pokes",
          filter: `id=eq.${state.activePoke.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          setState((prev) => ({
            ...prev,
            activePoke: prev.activePoke
              ? {
                  ...prev.activePoke,
                  status: newStatus,
                }
              : null,
          }));

          if (newStatus === "accepted") {
            navigate(`/chat/${state.activePoke?.sellerId}`);
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, user?.id, state.activePoke, navigate]);

  return {
    ...state,
    loadNearbySellers,
    pokeSeller,
    handlePokeResponse,
  };
}
