import { renderHook, act } from "@testing-library/react";
import { useLocation } from "../useLocation";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("useLocation", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    // Mock navigator.geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };
    // @ts-expect-error - navigator is read-only
    global.navigator.geolocation = mockGeolocation;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  test("should get the current location on mount", () => {
    const mockPosition = {
      coords: {
        latitude: 51.1,
        longitude: 45.3,
      },
    };

    // @ts-expect-error - navigator is read-only
    navigator.geolocation.getCurrentPosition.mockImplementationOnce((success) =>
      success(mockPosition),
    );

    const { result } = renderHook(() => useLocation());

    expect(result.current.location).toEqual({
      latitude: 51.1,
      longitude: 45.3,
    });
  });

  test("should update location every 5 minutes", () => {
    const mockPosition1 = {
      coords: {
        latitude: 51.1,
        longitude: 45.3,
      },
    };

    const mockPosition2 = {
      coords: {
        latitude: 52.2,
        longitude: 46.4,
      },
    };
    navigator.geolocation.getCurrentPosition
      // @ts-expect-error - navigator is read-only
      .mockImplementationOnce((success) => success(mockPosition1))
      // @ts-expect-error - navigator is read-only
      .mockImplementationOnce((success) => success(mockPosition2));

    const { result } = renderHook(() => useLocation());

    expect(result.current.location).toEqual({
      latitude: 51.1,
      longitude: 45.3,
    });

    act(() => {
      vi.advanceTimersByTime(300000); // Advance time by 5 minutes
    });

    expect(result.current.location).toEqual({
      latitude: 52.2,
      longitude: 46.4,
    });
  });

  test("should clear interval on unmount", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    const { unmount } = renderHook(() => useLocation());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });
});
