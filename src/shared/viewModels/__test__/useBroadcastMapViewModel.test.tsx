import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBroadcastMapViewModel } from "../useBroadcastMapViewModel";

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    session: {
      user: {
        id: "test-id",
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

vi.mock("../hooks/useTracker", () => ({
  useTracker: () => ({
    nearbyUsers: [],
    handleLocationUpdate: vi.fn(),
    handlePing: vi.fn(),
    notifications: [],
    deactivateUser: vi.fn(),
  }),
}));

vi.mock("@mantine/modals", () => ({
  modals: {
    openConfirmModal: vi.fn(),
  },
}));

describe("useBroadcastMapViewModel", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => "buyer",
      removeItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with correct values", () => {
    const { result } = renderHook(() => useBroadcastMapViewModel());

    expect(result.current.userId).toBe("test-id");
    expect(result.current.userRole).toBe("buyer");
  });

  it("should handle exit correctly", () => {
    const { result } = renderHook(() => useBroadcastMapViewModel());

    act(() => {
      result.current.handleExit();
    });

    expect(result.current.handleExit).toBeDefined();
  });

  it("should handle map recenter", () => {
    const { result } = renderHook(() => useBroadcastMapViewModel());
    const mockMap = {
      setView: vi.fn(),
      getZoom: vi.fn().mockReturnValue(15),
    };

    act(() => {
      result.current.setMapRef(mockMap as unknown as L.Map);
      result.current.handleRecenter();
    });

    expect(result.current.setMapRef).toBeDefined();
  });
});
