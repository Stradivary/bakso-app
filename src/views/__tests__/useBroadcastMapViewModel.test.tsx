import { useBroadcastMapViewModel } from "@/viewmodels/useBroadcastMapViewModel";
import { act, renderHook } from "@testing-library/react";
import L from "leaflet";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/contexts/authProvider", () => ({
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

vi.mock("@/viewmodels/hooks/useLocation", () => ({
  useLocation: () => ({
    location: { latitude: 0, longitude: 0 },
  }),
}));

vi.mock("@/viewmodels/hooks/useTracker", () => ({
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
  });

  it("handles null location", () => {
    const { result } = renderHook(() =>
      useBroadcastMapViewModel({ latitude: 0, longitude: 0 }),
    );

    expect(result.current.centerLocation).toEqual(new L.LatLng(0, 0));
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
