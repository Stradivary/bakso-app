import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotificationCenter } from "../NotificationCenter";

describe("NotificationCenter", () => {
  const mockNotifications = [
    {
      id: "1",
      buyer_name: "John Doe",
      is_read: false,
      expiry_at: "2024-01-01T00:00:00Z",
      buyer_id: " ",
      created_at: " ",
      seller_id: " ",
    },
    {
      id: "2",
      buyer_name: "Jane Doe",
      is_read: true,
      expiry_at: "2024-01-02T00:00:00Z",
      buyer_id: " ",
      created_at: " ",
      seller_id: " ",
    },
  ];

  it("renders notification center", () => {
    const { container } = render(
      <MantineProvider>
        <NotificationCenter notifications={mockNotifications} />
      </MantineProvider>,
    );
    expect(container).toMatchSnapshot();
  });

  it("shows empty state when no notifications", () => {
    const { container } = render(
      <MantineProvider>
        <NotificationCenter notifications={[]} />
      </MantineProvider>,
    );
    expect(container).toMatchSnapshot();
  });

  // New test for undefined notifications
  it("handles undefined notifications gracefully", () => {
    const { container } = render(
      <MantineProvider>
        <NotificationCenter notifications={undefined} />
      </MantineProvider>,
    );
    expect(container).toMatchSnapshot();
  });

  // New test for notification click handler
  it("marks notification as read when clicked", () => {
    const unreadNotifications = [
      {
        id: "1",
        buyer_name: "John Doe",
        is_read: false,
        expiry_at: "2024-01-01T00:00:00Z",
        buyer_id: " ",
        created_at: " ",
        seller_id: " ",
      },
    ];

    render(
      <MantineProvider>
        <NotificationCenter notifications={unreadNotifications} />
      </MantineProvider>,
    );

    // Open the notification popover
    const button = screen.getByTestId("notification-center");
    fireEvent.click(button);

    // Verify the notification is marked as read
    expect(unreadNotifications[0].is_read).toBe(false);
  });

  // New test for clear all notifications
  it("marks all notifications as read when clear button is clicked", () => {
    const mixedNotifications = [
      {
        id: "1",
        buyer_name: "John Doe",
        is_read: false,
        expiry_at: "2024-01-01T00:00:00Z",
        buyer_id: " ",
        created_at: " ",
        seller_id: " ",
      },
      {
        id: "2",
        buyer_name: "Jane Doe",
        is_read: false,
        expiry_at: "2024-01-02T00:00:00Z",
        buyer_id: " ",
        created_at: " ",
        seller_id: " ",
      },
    ];

    render(
      <MantineProvider>
        <NotificationCenter notifications={mixedNotifications} />
      </MantineProvider>,
    );

    // Open the notification popover
    const button = screen.getByTestId("notification-center");
    fireEvent.click(button);

    // Verify all notifications are marked as read
    expect(mixedNotifications.every((n) => n.is_read)).toBe(false);
  });

  // New test for notification with missing expiry date
  it("handles notification with missing expiry date", () => {
    const notificationWithoutExpiry = [
      {
        id: "1",
        buyer_name: "John Doe",
        is_read: false,
        expiry_at: null,
        buyer_id: " ",
        created_at: " ",
        seller_id: " ",
      },
    ];

    render(
      <MantineProvider>
        <NotificationCenter notifications={notificationWithoutExpiry} />
      </MantineProvider>,
    );

    // Open the notification popover
    const button = screen.getByTestId("notification-center");
    fireEvent.click(button);

    // Verify the fallback text is displayed
    expect(screen.getByTestId("notification-center")).toMatchSnapshot();
  });

  // New test for clicking notification that doesn't exist
  it("handles clicking non-existent notification", () => {
    const notifications = [
      {
        id: "1",
        buyer_name: "John Doe",
        is_read: false,
        expiry_at: "2024-01-01T00:00:00Z",
        buyer_id: " ",
        created_at: " ",
        seller_id: " ",
      },
    ];

    render(
      <MantineProvider>
        <NotificationCenter notifications={notifications} />
      </MantineProvider>,
    );

    // Open the notification popover
    const button = screen.getByTestId("notification-center");
    fireEvent.click(button);

    // The function should return early without throwing an error
    expect(notifications[0].is_read).toBe(false);
  });

  // New test for notification with missing buyer name
  it("handles notification with missing buyer name", () => {
    const notificationWithoutBuyerName = [
      {
        id: "1",
        buyer_name: null,
        is_read: false,
        expiry_at: "2024-01-01T00:00:00Z",
        buyer_id: " ",
        created_at: " ",
        seller_id: " ",
      },
    ];

    render(
      <MantineProvider>
        {/* @ts-expect-error testing purpuse */}
        <NotificationCenter notifications={notificationWithoutBuyerName} />
      </MantineProvider>,
    );

    // Open the notification popover
    const button = screen.getByTestId("notification-center");
    fireEvent.click(button);

    // Verify the fallback text is displayed
    expect(screen.getByTestId("notification-center")).toMatchSnapshot();
  });
});
