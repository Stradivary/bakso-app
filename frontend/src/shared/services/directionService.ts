import polyline from "@mapbox/polyline";
import { BASE_ROUTING_URL } from "../utils/constants";


class DirectionService {
  private static instance: DirectionService;

  private constructor() { }

  static getInstance(): DirectionService {
    if (!DirectionService.instance) {
      DirectionService.instance = new DirectionService();
    }
    return DirectionService.instance;
  }


  async getDirection(start: [number, number], end: [number, number]) {
    const url = `${BASE_ROUTING_URL}/${start.join(",")};${end.join(",")}?overview=false&geometries=polyline&steps=true`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch directions: ${response.statusText}`);
      }

      const data = await response.json();
      const steps = data.routes[0].legs[0].steps;

      // Decode polyline for all steps
      const polylineString = steps
        .map((step: { geometry: never; }) => step.geometry)
        .join("");
      const decodedPolyline = polyline.decode(polylineString);

      return {
        decodedPolyline, // Route path as array of coordinates
        steps, // Detailed steps from the API
      };
    } catch (error) {
      console.error("Error fetching directions:", error);
      throw error;
    }
  }
}

export default DirectionService.getInstance();
