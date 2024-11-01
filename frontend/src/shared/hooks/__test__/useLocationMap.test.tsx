import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { userService } from "../../services/userService";
import { useLocationMap } from "../useLocationMap";

vi.mock("../../services/userService", () => ({
  userService: {
    updateLocation: vi.fn(),
    findNearbyCounterparts: vi.fn(),
    deactivateUser: vi.fn(),
  },
}));

vi.mock("../../services/supabaseService", () => ({
  supabase: {
    channel: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    removeChannel: vi.fn(),
  },
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@mantine/hooks", () => ({
  useDisclosure: (initialState: boolean) => [
    initialState,
    { open: vi.fn(), close: vi.fn() },
  ],
}));

describe("useLocationMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize and update location", async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementationOnce((success) =>
        success({
          coords: {
            latitude: 51.1,
            longitude: 45.3,
          },
        }),
      ),
      watchPosition: vi.fn().mockImplementation((success) =>
        success({
          coords: {
            latitude: 51.1,
            longitude: 45.3,
          },
        }),
      ),
      clearWatch: vi.fn(),
    };

    // @ts-expect-error - navigator is readonly
    global.navigator.geolocation = mockGeolocation;

    const { result } = renderHook(() => useLocationMap());

    await waitFor(() => {
      expect(result.current.position).toEqual([51.1, 45.3]);
    });

    expect(userService.updateLocation).toHaveBeenCalledWith({
      latitude: 51.1,
      longitude: 45.3,
    });
    expect(userService.findNearbyCounterparts).toHaveBeenCalled();
  });

  it("should handle errors during location update", async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementationOnce((_, error) =>
        error({
          message: "User denied Geolocation",
        }),
      ),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };

    // @ts-expect-error - navigator is readonly
    global.navigator.geolocation = mockGeolocation;

    const { result } = renderHook(() => useLocationMap());

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Please enable location services to use this app.",
      );
    });
  });

  it("should refresh users", async () => {
    // mock position first
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementationOnce((success) =>
        success({
          coords: {
            latitude: 51.1,
            longitude: 45.3,
          },
        }),
      ),
      watchPosition: vi.fn().mockImplementation((success) =>
        success({
          coords: {
            latitude: 51.1,
            longitude: 45.3,
          },
        }),
      ),
      clearWatch: vi.fn(),
    };

    // @ts-expect-error - navigator is readonly
    global.navigator.geolocation = mockGeolocation;

    const { result } = renderHook(() => useLocationMap());

    await act(async () => {
      await result.current.refreshUsers();
    });

    expect(userService.updateLocation).toHaveBeenCalled();
  });

  it("should handle exit", async () => {
    const { result } = renderHook(() => useLocationMap());

    await act(async () => {
      await result.current.handleExit();
    });

    expect(userService.deactivateUser).toHaveBeenCalled();
  });
});
