import { render } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { AuthProvider } from "../authProvider";
import { RouteProvider } from "../routeProvider";
import { ThemeProvider } from "../themeProvider";
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

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.mock("@/presentation/components/ProtectedRoute", () => {
  return {
    ProtectedRoute: vi.fn(({ children }) => <div>{children}</div>),
  };
});

describe("RouteProvider", () => {
  // Mock implementation
  beforeAll(() => {
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
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
  it("renders without crashing", () => {
    const { container } = render(
      <ThemeProvider>
        <AuthProvider>
          <RouteProvider />
        </AuthProvider>
      </ThemeProvider>,
    );
    expect(container).toMatchSnapshot();
  });
});
