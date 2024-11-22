import { render } from "@testing-library/react";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  test,
  vi,
} from "vitest";
import { LoginPage } from "../login";
import { BroadcastMapPage } from "../map";
import { Contexts } from "@/shared/contexts/_root";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, never>;
  return {
    ...actual,
    useNavigate: vi.fn().mockImplementation((a) => console.log(a)),
  };
});

vi.mock("@/shared/contexts/authProvider", () => ({
  useAuth: () => ({
    session: {
      user: {
        id: "test-id",
        user_metadata: { display_name: "Test User" },
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

vi.mock("@/views/components/ProtectedRoute", () => {
  return {
    ProtectedRoute: vi.fn(({ children }) => <div>{children}</div>),
  };
});

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

// Example test using the mock
describe("Geolocation", () => {
  it("should get current position", async () => {
    const success = vi.fn();

    await navigator.geolocation.getCurrentPosition(success);

    expect(success).toHaveBeenCalledWith({
      coords: defaultCoords,
      timestamp: expect.any(Number),
    });
  });

  it("should handle watch position", () => {
    const success = vi.fn();
    const watchId = navigator.geolocation.watchPosition(success);

    expect(navigator.geolocation.watchPosition).toHaveBeenCalledWith(success);

    navigator.geolocation.clearWatch(watchId);
    expect(navigator.geolocation.clearWatch).toHaveBeenCalledWith(watchId);
  });
});

// Helper to change mock coordinates for specific tests
export const setMockCoordinates = (coords: Partial<MockCoordinates>) => {
  mockGeolocation.getCurrentPosition = vi.fn().mockImplementation((success) =>
    Promise.resolve(
      success({
        coords: { ...defaultCoords, ...coords },
        timestamp: Date.now(),
      }),
    ),
  );
};

test("it renders properly", () => {
  const { container } = render(
    <Contexts>
      <LoginPage />
    </Contexts>,
  );

  expect(container).toMatchSnapshot();
});

test("it renders map properly", () => {
  const { container } = render(
    <Contexts>
      <BroadcastMapPage />
    </Contexts>,
  );

  expect(container).toMatchSnapshot();
});
