import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MapUpdater, TargetMark, UserMarker } from "../MapUpdater";

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
        disabled={false}
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
        disabled={true}
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
        <UserMarker
          location={{ latitude: 1, longitude: 1 }}
          userRole="seller"
        />
      </MantineProvider>,
    );

    expect(screen.getByText("Lokasi Anda")).toBeDefined();
  });
});
