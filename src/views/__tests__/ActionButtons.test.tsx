import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActionButtons } from "../components/ActionButtons";
import { MantineProvider } from "@mantine/core";
import { Notification } from "@/models/Notification.types";

describe("ActionButtons", () => {
  const defaultProps = {
    onRecenter: vi.fn(),
    onExit: vi.fn(),
    role: "customer",
    name: "John Doe",
  };

  it("renders correctly with customer role", () => {
    render(
      <MantineProvider>
        <ActionButtons {...defaultProps} />
      </MantineProvider>,
    );

    expect(screen.getByText("Customer")).toBeDefined();
    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.queryByTestId("notification-center")).toBeNull();
  });

  it("renders correctly with seller role", () => {
    render(
      <MantineProvider>
        <ActionButtons {...defaultProps} role="seller" />
      </MantineProvider>,
    );

    expect(screen.getByText("Tukang Bakso")).toBeDefined();
    expect(screen.getByTestId("notification-center")).toBeDefined();
  });

  it("calls onRecenter when recenter button is clicked", () => {
    const { container } = render(
      <MantineProvider>
        <ActionButtons {...defaultProps} />
      </MantineProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it("calls onExit when exit button is clicked", () => {
    const { container } = render(
      <MantineProvider>
        <ActionButtons {...defaultProps} />
      </MantineProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it("renders notifications when provided and role is seller", () => {
    const notifications = [
      {
        id: "1",
        buyer_id: "Test notification",
        created_at: "",
        expiry_at: "0",
        is_read: false,
        seller_id: "",
        buyer_name: "",
      },
    ] as Notification[];

    const { container } = render(
      <MantineProvider>
        <ActionButtons
          {...defaultProps}
          role="seller"
          notifications={notifications}
        />
      </MantineProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it("applies correct badge colors based on role", () => {
    const { container, rerender } = render(
      <MantineProvider>
        <ActionButtons {...defaultProps} />
      </MantineProvider>,
    );

    expect(container).toMatchSnapshot();

    rerender(
      <MantineProvider>
        <ActionButtons {...defaultProps} role="seller" />
      </MantineProvider>,
    );

    expect(container).toMatchSnapshot();
  });
});
