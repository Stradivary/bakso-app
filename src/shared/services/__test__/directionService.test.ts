import { describe, it, expect, vi } from "vitest";
import DirectionService from "../directionService";

describe("DirectionService", () => {
  it("should return decoded polyline and steps when fetching directions succeeds", async () => {
    // Mock fetch response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            routes: [
              {
                legs: [
                  {
                    steps: [
                      { geometry: "abcd" }, // Mocked geometry data
                    ],
                  },
                ],
              },
            ],
          }),
      }),
    ) as unknown as typeof fetch;

    const start: [number, number] = [37.7749, -122.4194];
    const end: [number, number] = [34.0522, -118.2437];

    const result = await DirectionService.getDirection(start, end);

    expect(result).toHaveProperty("decodedPolyline");
    expect(result).toHaveProperty("steps");

    vi.restoreAllMocks();
  });

  it("should throw an error when fetching directions fails", async () => {
    // Mock fetch to return an error
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        statusText: "Error fetching directions",
      }),
    ) as unknown as typeof fetch;

    const start: [number, number] = [37.7749, -122.4194];
    const end: [number, number] = [34.0522, -118.2437];

    await expect(DirectionService.getDirection(start, end)).rejects.toThrow(
      "Failed to fetch directions: Error fetching directions",
    );

    // Clean up mock
    vi.restoreAllMocks();
  });
});
