import { renderHook } from "@testing-library/react";
import { LatLng } from "leaflet";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { UPDATE_INTERVAL, useLocationUpdater } from "../useLocationUpdater";

vi.mock("./useLocation", () => ({
  useLocation: vi
    .fn()
    .mockReturnValue({ location: { latitude: 1, longitude: 1 } }),
}));

describe("useLocationUpdater", () => {
  const mockUpdateLocation = vi.fn();
  const mockLocation = { latitude: 1, longitude: 1 };
  // Define mock coordinates type for better TypeScript support
  interface MockCoordinates {
    latitude: number | null;
    longitude: number | null;
    accuracy: number;
    altitude: null | number;
    altitudeAccuracy: null | number;
    heading: null | number;
    speed: null | number;
  }

  // Default mock coordinates
  const defaultCoords: MockCoordinates = {
    latitude: 1,
    longitude: 1,
    accuracy: 100,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  };

  // Create mock geolocation object
  const mockGeolocation = {
    getCurrentPosition: vi.fn().mockImplementation((success) =>
      Promise.resolve(
        success({
          coords: defaultCoords,
          timestamp: Date.now(),
        }),
      ),
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };

  // Setup before tests
  beforeAll(() => {
    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
    });
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  // Clean up after tests
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  // Optional: Reset mocks between tests
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("updates location for seller role", () => {
    vi.useFakeTimers();

    renderHook(() =>
      useLocationUpdater({
        userId: "123",
        userRole: "seller",
        updateLocation: mockUpdateLocation,
      }),
    );

    vi.advanceTimersByTime(UPDATE_INTERVAL);
    expect(mockUpdateLocation).toHaveBeenCalledWith("123", expect.any(LatLng));

    vi.useRealTimers();
  });

  it("does not update location when disabled", () => {
    vi.useFakeTimers();

    renderHook(() =>
      useLocationUpdater({
        userId: "123",
        userRole: "buyer",
        updateLocation: mockUpdateLocation,
      }),
    );

    vi.advanceTimersByTime(UPDATE_INTERVAL);
    expect(mockUpdateLocation).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("returns location from useLocation hook", () => {
    const { result } = renderHook(() =>
      useLocationUpdater({
        userId: "123",
        userRole: "seller",
        updateLocation: mockUpdateLocation,
      }),
    );

    expect(result.current).toEqual(mockLocation);
  });
});
