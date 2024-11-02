import { User } from "../models/user.types";
import { supabase } from "./supabaseService";

const LOCATION_PRECISION = 3; // 3 ~111m precision
const MIN_DISTANCE_KM = 2; // 2 km


class AuthService {
  private static instance: AuthService;

  private constructor() { }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private encodeLocation(latitude: number, longitude: number): string {
    const normalizedLat = this.normalizeLocation(latitude);
    const normalizedLong = this.normalizeLocation(longitude);
    const locationString = `${normalizedLat},${normalizedLong}`;
    return Buffer.from(locationString).toString("base64");
  }

  // private decodeLocation(base64Location: string): { latitude: number; longitude: number; } {
  //   const locationString = Buffer.from(base64Location, "base64").toString();
  //   const [latitude, longitude] = locationString.split(",").map(Number);
  //   return { latitude, longitude };
  // }

  private generateLocationBasedEmail(name: string, role: string, location: { latitude: number; longitude: number; }): string {
    const cleanName = name.replace(/\s/g, "").toLowerCase();
    const locationCode = this.encodeLocation(location.latitude, location.longitude);
    return `${cleanName}+${locationCode}@${role}.com`;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private normalizeLocation(coord: number): number {
    return Number(coord.toFixed(LOCATION_PRECISION));
  }

  private generateLocationBasedPassword(name: string, role: string, location: { latitude: number; longitude: number; }): string {
    const normalizedLat = this.normalizeLocation(location.latitude);
    const normalizedLong = this.normalizeLocation(location.longitude);
    return `${name}_${role}_${normalizedLat}_${normalizedLong}`;
  }

  public async registerOrLogin(name: string, role: string, location: { latitude: number; longitude: number; }): Promise<User> {
    const normalizedLocation = {
      latitude: this.normalizeLocation(location.latitude),
      longitude: this.normalizeLocation(location.longitude),
    };

    const email = this.generateLocationBasedEmail(name, role, normalizedLocation);
    const locationBasedPassword = this.generateLocationBasedPassword(name, role, normalizedLocation);

    const { data: existingUsers, error: queryError } = await supabase
      .from("users")
      .select("*")
      .eq("name", name)
      .eq("role", role);

    if (queryError) {
      throw new Error(`Error checking for existing users: ${queryError.message}`);
    }

    if (existingUsers && existingUsers.length > 0) {
      const tooClose = existingUsers.some((user) => {
        try {
          const userLocation = (user.location as string)
            .replace("POINT(", "")
            .replace(")", "")
            .split(" ");
          const distance = this.calculateDistance(
            normalizedLocation.latitude,
            normalizedLocation.longitude,
            parseFloat(userLocation[1]),
            parseFloat(userLocation[0]),
          );
          return distance < MIN_DISTANCE_KM;
        } catch (error) {
          console.error("Error calculating distance:", error);
          return false;
        }
      });

      if (tooClose) {
        throw new Error(`A user with the same name and role exists within ${MIN_DISTANCE_KM}km of this location`);
      }
    }

    let authUser;
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: locationBasedPassword,
    });

    if (!signInError) {
      authUser = signInData.user;
    } else if (!signInError.message.includes("Invalid login credentials")) {
      throw signInError;
    }

    if (!authUser) {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password: locationBasedPassword,
        options: {
          data: {
            name,
            role,
            location: `SRID=4326;POINT(${normalizedLocation.longitude} ${normalizedLocation.latitude})`,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("User already registered")) {
          throw new Error("User already exists but password is incorrect. Please contact support.");
        }
        throw signUpError;
      }

      authUser = user;
    }

    if (!authUser?.id) {
      throw new Error("Failed to get user ID from auth system");
    }

    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (dbError && dbError.code !== "PGRST116") {
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (!dbUser) {
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: authUser.id,
          email,
          name,
          role: role === "customer" ? "customer" : "seller",
          location: `SRID=4326;POINT(${normalizedLocation.longitude} ${normalizedLocation.latitude})`,
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        throw new Error(`Failed to create user record: ${insertError.message}`);
      }
    } else {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          location: `SRID=4326;POINT(${normalizedLocation.longitude} ${normalizedLocation.latitude})`,
          last_seen: new Date().toISOString(),
        })
        .eq("id", authUser.id);

      if (updateError) {
        console.error("Failed to update user data:", updateError);
      }
    }

    return {
      id: authUser.id,
      email,
      name,
      role: role as "customer" | "seller",
      location: normalizedLocation,
      rating: 5,
    };
  }

  public async verifyLocation(name: string, role: string, location: { latitude: number; longitude: number; }): Promise<boolean> {
    const normalizedLocation = {
      latitude: this.normalizeLocation(location.latitude),
      longitude: this.normalizeLocation(location.longitude),
    };

    const { data: existingUsers } = await supabase
      .from("users")
      .select("*")
      .eq("name", name)
      .eq("role", role);

    if (!existingUsers?.length) return true;

    return !existingUsers.some((user) => {
      const userLocation = (user.location as string)
        .replace("POINT(", "")
        .replace(")", "")
        .split(" ");
      const distance = this.calculateDistance(
        normalizedLocation.latitude,
        normalizedLocation.longitude,
        parseFloat(userLocation[1]),
        parseFloat(userLocation[0]),
      );
      return distance < MIN_DISTANCE_KM;
    });
  }
}

export const authService = AuthService.getInstance();
