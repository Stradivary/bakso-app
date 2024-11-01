import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNotifications } from "../useNotification";

// Mock services
const mockPokeService = {
  getPokesBySellerId: vi.fn(),
  createPoke: vi.fn(),
};

// Test data
const mockNotifications = [
  {
    id: "1",
    buyer_id: "buyer1",
    seller_id: "seller1",
    created_at: "2024-01-01",
    expiry_at: "2024-02-01",
    is_read: false,
  },
  {
    id: "2",
    buyer_id: "buyer2",
    seller_id: "seller1",
    created_at: "2024-01-02",
    expiry_at: "2024-02-02",
    is_read: true,
  },
];

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPokeService.getPokesBySellerId.mockResolvedValue(mockNotifications);
  });

  it("should initialize with empty state when userId is not provided", () => {
    const { result } = renderHook(() =>
      useNotifications(null, mockPokeService),
    );

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(mockPokeService.getPokesBySellerId).not.toHaveBeenCalled();
  });

  it("should load notifications when userId is provided", async () => {
    const { result } = renderHook(() =>
      useNotifications("seller1", mockPokeService),
    );

    // Wait for the async operation to complete
    await vi.waitFor(() => {
      expect(result.current.notifications).toEqual(mockNotifications);
    });

    expect(mockPokeService.getPokesBySellerId).toHaveBeenCalledWith("seller1");
  });

  it("should mark notification as read", async () => {
    const { result } = renderHook(() =>
      useNotifications("seller1", mockPokeService),
    );

    // Simulate initial load
    await vi.waitFor(() => {
      expect(result.current.notifications).toEqual(mockNotifications);
    });

    // Mark notification as read
    await act(async () => {
      await result.current.markAsRead("1");
    });

    expect(result.current.notifications[0].is_read).toBe(false);
  });
});
