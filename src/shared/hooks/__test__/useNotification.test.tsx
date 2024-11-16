import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useNotifications } from "../useNotification";

describe("useNotifications", () => {
  const mockNotifications = [
    {
      id: "1",
      buyer_id: "buyer1",
      seller_id: "seller1",
      created_at: "2023-01-01",
      expiry_at: "2023-01-02",
      is_read: false,
      buyer_name: "John",
    },
  ];

  it("should initialize with empty notifications", () => {
    const { result } = renderHook(() => useNotifications("user1"));
    expect(result.current).toMatchSnapshot();
  });

  it("should initialize with provided notifications", () => {
    const { result } = renderHook(() =>
      useNotifications("user1", mockNotifications),
    );
    expect(result.current).toMatchSnapshot();
  });

  it("should mark notification as read", async () => {
    const { result } = renderHook(() =>
      useNotifications("user1", mockNotifications),
    );

    await act(async () => {
      await result.current.markAsRead("1");
    });

    expect(result.current).toMatchSnapshot();
  });
});
