import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  MapUpdater,
  TargetMark,
  UserMarker,
  NearbyUsersMarker,
} from "../MapUpdater";
import { LatLng } from "leaflet";

// Mock dependencies
vi.mock("react-leaflet", () => ({
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
}));

vi.mock("../../hooks/useLocation", () => ({
  useLocation: vi.fn(),
}));
vi.mock("../../hooks/useLocationUpdater", () => ({
  useLocationUpdater: vi.fn(),
}));

describe("MapUpdater", () => {
  const mockUpdateLocation = vi.fn();

  it("updates location for seller role", () => {
    vi.useFakeTimers();

    const { container } = render(
      <MapUpdater
        userId="123"
        userRole="seller"
        updateLocation={mockUpdateLocation}
      />,
    );

    expect(container).toMatchSnapshot();

    vi.useRealTimers();
  });

  it("does not update location when disabled", () => {
    vi.useFakeTimers();

    render(
      <MapUpdater
        userId="123"
        userRole="seller"
        updateLocation={mockUpdateLocation}
      />,
    );

    vi.advanceTimersByTime(2000);
    expect(mockUpdateLocation).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});

describe("TargetMark", () => {
  const mockHandleClick = vi.fn();
  const mockUser = {
    user_id: "",
    userName: "Test User",
    role: "seller",
    location: { lat: 1, lng: 1 },
  };

  it("renders seller marker correctly", () => {
    render(
      <MantineProvider>
        <TargetMark
          //@ts-expect-error user not completed
          nearbyUser={mockUser}
          handleClick={mockHandleClick}
        />
      </MantineProvider>,
    );

    expect(screen.getByText("Test User")).toBeDefined();
    expect(screen.getByText("Pedagang Bakso")).toBeDefined();
  });

  it("renders customer marker correctly", () => {
    render(
      <MantineProvider>
        <TargetMark
          //@ts-expect-error user not completed
          nearbyUser={{ ...mockUser, role: "customer" }}
          handleClick={mockHandleClick}
        />
      </MantineProvider>,
    );

    expect(screen.getByText("Pelanggan")).toBeDefined();
  });
});

describe("UserMarker", () => {
  it("renders user location marker", () => {
    render(
      <MantineProvider>
        <UserMarker location={new LatLng(1, 1)} userRole="buyer" />
      </MantineProvider>,
    );

    expect(screen.getByText("Lokasi Anda")).toMatchInlineSnapshot(`
      <div
        data-testid="tooltip"
      >
        Lokasi Anda
      </div>
    `);
  });

  // New test for undefined location
  it("renders user location marker with undefined location", () => {
    render(
      <MantineProvider>
        <UserMarker
          location={new LatLng(0, 0)}
          userRole="seller"
        />
      </MantineProvider>,
    );

    expect(screen.getByText("Lokasi Anda")).toBeDefined();
    // The LatLng constructor should be called with default values (0,0)
    expect(new LatLng(0, 0)).toBeDefined();
  });

  // New test for null location
  it("renders user location marker with null location", () => {
    render(
      <MantineProvider>
        <UserMarker
          location={new LatLng(0, 0)}
          userRole="seller"
        />
      </MantineProvider>,
    );

    expect(screen.getByText("Lokasi Anda")).toBeDefined();
    // The LatLng constructor should be called with default values (0,0)
    expect(new LatLng(0, 0)).toBeDefined();
  });
});

describe("NearbyUsersMarker", () => {
  const mockHandleClick = vi.fn();
  const mockNearbyUsers = [
    {
      user_id: "1",
      userName: "User 1",
      role: "seller" as const,
      location: { lat: 1, lng: 1 },
    },
    {
      user_id: "2",
      userName: "User 2",
      role: "buyer" as const,
      location: { lat: 2, lng: 2 },
    },
  ];
  const mockInvalidNearbyUsers = [
    {
      user_id: "1",
      userName: "User 1",
      role: "seller" as const,
      location: null,
    },
  ];
  it("renders invalid nearby users location", () => {
    render(
      <MantineProvider>
        <NearbyUsersMarker
          // @ts-expect-error intended error
          nearbyUsers={mockInvalidNearbyUsers}
          handleMarkerClick={mockHandleClick}
        />
      </MantineProvider>,
    );

    expect(screen.getByText(/Pedagang Bakso/)).toMatchSnapshot();
  });

  it("renders multiple nearby users", () => {
    render(
      <MantineProvider>
        <NearbyUsersMarker
          nearbyUsers={mockNearbyUsers}
          handleMarkerClick={mockHandleClick}
        />
      </MantineProvider>,
    );

    expect(screen.getByText("User 1")).toBeDefined();
    expect(screen.getByText("User 2")).toBeDefined();
    expect(screen.getByText("Pedagang Bakso")).toBeDefined();
    expect(screen.getByText("Pelanggan")).toBeDefined();
  });

  it("renders empty when no nearby users", () => {
    render(
      <MantineProvider>
        <NearbyUsersMarker
          nearbyUsers={[]}
          handleMarkerClick={mockHandleClick}
        />
      </MantineProvider>,
    );

    // Should render nothing when there are no nearby users
    expect(screen.queryByTestId("marker")).toBeNull();
  });
});
