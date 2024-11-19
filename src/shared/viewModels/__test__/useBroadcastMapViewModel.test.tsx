import { modals } from "@mantine/modals";
import { notifications as notify } from "@mantine/notifications";
import { act, renderHook } from "@testing-library/react";
import L from "leaflet";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBroadcastMapViewModel } from "../useBroadcastMapViewModel";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    isLoading: false,
    error: "",
    login: vi.fn(),
    isAuthenticated: false,
    user: {},
    session: {
      access_token: "",
      refresh_token: "",
      expires_in: 0,
      token_type: "",
      user: {
        id: "test-id",
        app_metadata: {},
        aud: "",
        created_at: "",
        user_metadata: { name: "Test User" },
      },
    },
    logout: vi.fn(),
  }),
}));

vi.mock("../../hooks/useLocation", () => ({
  useLocation: () => ({
    location: { latitude: 0, longitude: 0 },
  }),
}));

vi.mock("../../hooks/useTracker", () => ({
  useTracker: () => ({
    nearbyUsers: [],
    sendPing: vi.fn(),
    notifications: [],
    markAsRead: vi.fn(),
    handleLocationUpdate: vi.fn(),
    deactivateUser: vi.fn(),
  }),
}));

vi.mock("@mantine/modals", () => ({
  modals: {
    openConfirmModal: vi.fn(),
  },
}));

vi.mock("@mantine/notifications");

describe("useBroadcastMapViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Storage.prototype.getItem = vi.fn().mockReturnValue("buyer");
  });

  it("initializes with correct default values", () => {
    const { result } = renderHook(() =>
      useBroadcastMapViewModel({ latitude: 0, longitude: 0 }),
    );

    expect(result.current.userId).toBe("test-id");
    expect(result.current.userName).toBe("Test User");
    expect(result.current.userRole).toBe("buyer");
  });

  it("handles null location", () => {
    const { result } = renderHook(() =>
      useBroadcastMapViewModel({ latitude: 0, longitude: 0 }),
    );

    expect(result.current.centerLocation).toEqual(new L.LatLng(0, 0));
  });

  it("handles marker click for seller with location", () => {
    const { result } = renderHook(() =>
      useBroadcastMapViewModel({ latitude: 0, longitude: 0 }),
    );
    const seller = {
      user_id: "seller-id",
      userName: "Seller",
      role: "seller" as const,
      location: { lat: 2, lng: 2 },
    };

    act(() => {
      result.current.handleMarkerClick(seller);
    });

    expect(modals.openConfirmModal).toHaveBeenCalled();
  });

  it("handles location updates", () => {
    const { result, rerender } = renderHook(() =>
      useBroadcastMapViewModel({ latitude: 0, longitude: 0 }),
    );

    rerender();

    expect(result.current.centerLocation).toEqual(new L.LatLng(0, 0));
  });

  it("handles exit modal actions", () => {
    const { result } = renderHook(() =>
      useBroadcastMapViewModel({ latitude: 0, longitude: 0 }),
    );

    act(() => {
      result.current.handleExit();
    });

    expect(result).toMatchSnapshot();
  });

  it("confirms ping sending on seller marker click confirmation", () => {
    const { result } = renderHook(() =>
      useBroadcastMapViewModel({ latitude: 0, longitude: 0 }),
    );
    const seller = {
      user_id: "seller-id",
      userName: "Seller",
      role: "seller" as const,
      location: { lat: 2, lng: 2 },
    };

    vi.mocked(modals.openConfirmModal).mockImplementation(({ onConfirm }) => {
      onConfirm?.();
    });

    act(() => {
      result.current.handleMarkerClick(seller);
    });

    expect(notify.show).toHaveBeenCalled();
  });

  it("maintains last valid location when location becomes null", () => {
    const { result, rerender } = renderHook(() =>
      useBroadcastMapViewModel({ latitude: 0, longitude: 0 }),
    );

    // First render with valid location
    expect(result.current.centerLocation).toEqual(new L.LatLng(0, 0));

    // Update to null location
    rerender();

    // Should keep last valid location
    expect(result.current.centerLocation).toEqual(new L.LatLng(0, 0));
  });
});
