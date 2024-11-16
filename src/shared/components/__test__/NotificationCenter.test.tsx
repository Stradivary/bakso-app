import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";
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
});
