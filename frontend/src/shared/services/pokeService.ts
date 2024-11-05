import { supabase } from "./supabaseService";

class PokeService {

  private static instance: PokeService;

  private constructor() { }

  static getInstance(): PokeService {
    if (!PokeService.instance) {
      PokeService.instance = new PokeService();
    }
    return PokeService.instance;
  }

  /**
   * Calls the `create_poke` RPC function to create a new poke.
   * @param buyer_id - UUID of the buyer.
   * @param seller_id - UUID of the seller.
   * @param expiry_minutes - Expiry time in minutes for the poke.
   * @returns Success message or error.
   */
  async createPoke(
    buyer_id: string,
    seller_id: string,
    expiry_minutes: number,
  ): Promise<{ success: boolean; message: string; }> {
    try {
      const { error } = await supabase.rpc("create_poke", {
        p_buyer_id: buyer_id,
        p_seller_id: seller_id,
        p_expiry_minutes: expiry_minutes,
      });

      if (error) throw error;

      return { success: true, message: "Poke created successfully." };
    } catch (error) {
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || "Error creating poke.",
        };
      }
      return { success: false, message: "Unknown error creating poke." };
    }
  }

  async getPokesBySellerId(seller_id: string) {
    try {
      const { data, error } = await supabase
        .from("pokes")
        .select("*")
        .order('buyer_id', { ascending: true })
        .eq("seller_id", seller_id);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching pokes:", error);
      return [];
    }
  }
}

export const pokeService = PokeService.getInstance();
