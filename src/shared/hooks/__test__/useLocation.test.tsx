import { renderHook } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  afterEach,
  afterAll,
  beforeAll,
  beforeEach,
} from "vitest";
import { useLocation } from "../useLocation";

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
  latitude: null,
  longitude: null,
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

describe("useLocation", () => {
  it("should initialize with null location", () => {
    const { result } = renderHook(() => useLocation());
    expect(result.current).toMatchSnapshot();
  });

  it("should update location when position changes", () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    };

    global.navigator.geolocation.getCurrentPosition = vi.fn((success) =>
      success(mockPosition),
    );

    const { result } = renderHook(() => useLocation());

    vi.advanceTimersByTime(3000);
    expect(result.current).toMatchSnapshot();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
