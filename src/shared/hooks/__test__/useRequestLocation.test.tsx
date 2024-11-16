import { act, renderHook } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { useRequestLocation } from "../useRequestLocation";

// Define mock coordinates type for better TypeScript support
interface MockCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: null | number;
  altitudeAccuracy: null | number;
  heading: null | number;
  speed: null | number;
}

// Default mock coordinates
const defaultCoords: MockCoordinates = {
  latitude: -6.2088,
  longitude: 106.8456,
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
  vi.useFakeTimers();
  Object.defineProperty(global.navigator, "geolocation", {
    value: mockGeolocation,
    writable: true,
  });
});

// Clean up after tests
afterAll(() => {
  vi.unstubAllGlobals();
});

// Optional: Reset mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});

describe("useRequestLocation", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useRequestLocation());
    expect(result.current).toMatchSnapshot();
  });

  it("should handle successful location request", async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    };

    global.navigator.geolocation.getCurrentPosition = vi.fn((success) =>
      success(mockPosition),
    );

    const { result } = renderHook(() => useRequestLocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current).toMatchSnapshot();
  });

  it("should handle location error", () => {
    const mockError = new Error("Location denied");
    global.navigator.geolocation.getCurrentPosition = vi.fn((_, error) =>
      error(mockError),
    );

    const { result } = renderHook(() => useRequestLocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current).toMatchSnapshot();
  });
});
