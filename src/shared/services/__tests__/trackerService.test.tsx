import { LatLng } from "leaflet";
import { describe, expect, it, vi } from "vitest";
import { calculateRegion } from "@/shared/utils/calculateRegion";
import { calculateDistance } from "@/shared/utils/calculateDistance";
import { createPingPayload } from "@/shared/utils/createPingPayload";
import { filterNearbyUsers } from "@/shared/utils/filterNearbyUsers";
import { initSupabaseChannel } from "../trackerServices";
import { supabase } from "../supabaseService";

vi.mock("../supabaseService", () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn(),
      subscribe: vi.fn(),
      track: vi.fn(),
    })),
  },
}));

describe("trackerServices", () => {
  describe("calculateRegion", () => {
    it("should calculate region based on latitude and longitude", () => {
      const region = calculateRegion(12.3456, 78.9101);
      expect(region).toBe(Buffer.from("123-789").toString("base64"));
    });
  });

  describe("calculateDistance", () => {
    it("should return the correct distance between two points", () => {
      const point1 = new LatLng(52.52, 13.405);
      const point2 = new LatLng(48.8566, 2.3522);
      const distance = calculateDistance(point1, point2);
      expect(distance).toBeCloseTo(877463, -2); // Approximate distance in meters
    });

    it("should return MAX_SAFE_INTEGER if any point is missing", () => {
      const point1 = new LatLng(52.52, 13.405);
      // @ts-expect-error testing missing point
      const distance = calculateDistance(point1, null);
      expect(distance).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe("filterNearbyUsers", () => {
    const users = [
      {
        id: "1",
        user_id: "1",
        role: "seller" as const,
        location: { lat: 52.52, lng: 13.405 },
        isOnline: true,
        display_name: "Seller1",
        isAvailable: true,
        seller_id: "1",
      },
      {
        id: "2",
        user_id: "2",
        role: "buyer" as const,
        location: { lat: 48.8566, lng: 2.3522 },
        isOnline: true,
        display_name: "Buyer1",
        isAvailable: true,
        seller_id: "2",
      },
      // ...other users...
    ];

    it("should filter nearby sellers for a buyer", () => {
      const currentLocation = new LatLng(52.52, 13.405);
      const nearbyUsers = filterNearbyUsers(users, currentLocation, "buyer");
      expect(nearbyUsers).toHaveLength(1);
      expect(nearbyUsers[0].role).toBe("seller");
    });

    it("should filter nearby buyers for a seller", () => {
      const currentLocation = new LatLng(48.8566, 2.3522);
      const nearbyUsers = filterNearbyUsers(users, currentLocation, "seller");
      expect(nearbyUsers).toHaveLength(1);
      expect(nearbyUsers[0].role).toBe("buyer");
    });

    it("should exclude the user itself", () => {
      const currentLocation = new LatLng(52.52, 13.405);
      const nearbyUsers = filterNearbyUsers(
        users,
        currentLocation,
        "buyer",
        "1",
      );
      expect(nearbyUsers).toHaveLength(0);
    });
  });

  describe("createPingPayload", () => {
    it("should create a ping payload with the correct structure", () => {
      const payload = createPingPayload({
        buyer_id: "buyer1",
        buyer_name: "Buyer One",
        user_id: "seller1",
      });
      expect(payload).toMatchObject({
        buyer_id: "buyer1",
        buyer_name: "Buyer One",
        seller_id: "seller1",
        is_read: false,
      });
      expect(payload.id).toContain("buyer1-");
      expect(new Date(payload.created_at).getTime()).toBeLessThanOrEqual(
        Date.now(),
      );
      expect(new Date(payload.expiry_at).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("initSupabaseChannel", () => {
    const mockHandlers = {
      handlePresenceSync: vi.fn(),
      handlePing: vi.fn(),
      handleLocationUpdate: vi.fn(),
    };

    const mockUser = {
      userId: "testUser",
      userRole: "seller" as const,
      userName: "Test User",
    };

    const mockLocation = new LatLng(52.52, 13.405);
    const mockRegion = "testRegion";

    it("should initialize the Supabase channel and handle presence sync", async () => {
      const channel = await initSupabaseChannel(
        mockLocation,
        mockRegion,
        mockUser,
        mockHandlers,
      );
      expect(channel).toBeDefined();
      expect(supabase.channel).toHaveBeenCalledWith(mockRegion, {
        config: { presence: { key: mockUser.userId } },
      });
    });
  });
});
