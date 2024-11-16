import { LatLng } from "leaflet";
import { describe, expect, it } from "vitest";
import { calculateDistance, calculateRegion } from "../trackerServices";

describe("calculateRegion", () => {
  it("should return the correct region string for given latitude and longitude", () => {
    const region = calculateRegion(37.7749, -122.4194);
    const expectedRegion = Buffer.from(
      `${Math.floor(37.7749 * 10)}-${Math.floor(-122.4194 * 10)}`,
    ).toString("base64");
    expect(region).toBe(expectedRegion);
  });
});

describe("calculateDistance", () => {
  it("should return zero when both points are the same", () => {
    const point = new LatLng(37.7749, -122.4194);
    const distance = calculateDistance(point, point);
    expect(distance).toBe(0);
  });

  it("should calculate the correct distance between two points", () => {
    const point1 = new LatLng(37.7749, -122.4194);
    const point2 = new LatLng(34.0522, -118.2437);
    const distance = calculateDistance(point1, point2);
    expect(distance).toBeGreaterThan(0);
  });
});
