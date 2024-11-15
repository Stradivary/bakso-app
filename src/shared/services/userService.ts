
import { UserServiceError, SearchParams, NearbyUser, Location } from "../models/user.types";
import { supabase } from "./supabaseService";


export class UserService {
  private readonly DEFAULT_ACTIVE_WITHIN_MINUTES = 15;
  private readonly DEFAULT_MAX_RESULTS = 50;
  private static instance: UserService;

  private constructor() {
    // empty
   }

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private getCurrentUserId(): string {
    const user = sessionStorage.getItem("user");
    const userId = user ? JSON.parse(user).id : null;
    if (!userId) {
      throw new UserServiceError(
        "User ID not found in storage",
        "USER_NOT_FOUND",
      );
    }
    return userId;
  }

  /**
   * Update user's current location and activity status
   */
  async updateLocation(location: Location): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const { error } = await supabase
        .from("users")
        .update({
          location: `SRID=4326;POINT(${location.longitude} ${location.latitude})`,
          last_seen: new Date().toISOString(),
          is_active: true,
        })
        .eq("id", userId);

      if (error) {
        throw new UserServiceError(
          `Failed to update location: ${error.message}`,
          "UPDATE_LOCATION_ERROR",
        );
      }
    } catch (error) {
      if (error instanceof UserServiceError) throw error;
      throw new UserServiceError(
        `Unexpected error updating location: ${error}`,
        "UNKNOWN_ERROR",
      );
    }
  }

  /**
   * Find nearby users of the opposite role (sellers find customers, customers find sellers)
   */
  async findNearbyCounterparts(params: SearchParams): Promise<NearbyUser[]> {
    try {
      const userId = this.getCurrentUserId();
      // const userRole = await this.getUserRole(userId);
      const activeWithinMinutes =
        params.activeWithinMinutes ?? this.DEFAULT_ACTIVE_WITHIN_MINUTES;
      const maxResults = params.maxResults ?? this.DEFAULT_MAX_RESULTS;

      const { data, error } = await supabase.rpc("find_nearby_users", {
        user_id: userId,
        p_latitude: params.latitude,
        p_longitude: params.longitude,
        radius_meters: params.radiusMeters,
        max_results: maxResults,
        min_rating: params.minRating ?? 0,
        active_within_minutes: activeWithinMinutes,
      });

      if (error) {
        throw new UserServiceError(
          `Failed to find nearby users: ${error.message}`,
          "NEARBY_SEARCH_ERROR",
        );
      }

      return data.map(({ user_role, ...user }) => ({
        ...user,
        role: user_role,
        distance: Math.round(user.distance),
        location: {
          latitude: user.latitude,
          longitude: user.longitude,
        },
      }));
    } catch (error) {
      if (error instanceof UserServiceError) throw error;
      throw new UserServiceError(
        `Unexpected error finding nearby users: ${error}`,
        "UNKNOWN_ERROR",
      );
    }
  }

  /**
   * Deactivate user and update last seen timestamp
   */
  async deactivateUser(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const { error } = await supabase
        .from("users")
        .update({
          is_active: false,
          last_seen: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        throw new UserServiceError(
          `Failed to deactivate user: ${error.message}`,
          "DEACTIVATE_ERROR",
        );
      }
    } catch (error) {
      if (error instanceof UserServiceError) throw error;
      throw new UserServiceError(
        `Unexpected error deactivating user: ${error}`,
        "UNKNOWN_ERROR",
      );
    }
  }

  /**
   * Reactivate user and update last seen timestamp
   */
  async reactivateUser(): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const { error } = await supabase
        .from("users")
        .update({
          is_active: true,
          last_seen: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        throw new UserServiceError(
          `Failed to reactivate user: ${error.message}`,
          "REACTIVATE_ERROR",
        );
      }
    } catch (error) {
      if (error instanceof UserServiceError) throw error;
      throw new UserServiceError(
        `Unexpected error reactivating user: ${error}`,
        "UNKNOWN_ERROR",
      );
    }
  }


}

// Export singleton instance
export const userService = UserService.getInstance();
