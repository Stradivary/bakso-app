import polyline from '@mapbox/polyline';

const baseUrl = 'https://routing.openstreetmap.de/routed-foot/route/v1/driving';

class DirectionService {

  async getDirection(start: [number, number], end: [number, number]) {
    const url = `${baseUrl}/${start.join(',')};${end.join(',')}?overview=false&geometries=polyline&steps=true`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch directions: ${response.statusText}`);
      }

      const data = await response.json();
      const steps = data.routes[0].legs[0].steps;

      // Decode polyline for all steps
      const polylineString = steps.map((step: { geometry: never; }) => step.geometry).join('');
      const decodedPolyline = polyline.decode(polylineString);

      return {
        decodedPolyline, // Route path as array of coordinates
        steps,           // Detailed steps from the API
      };
    } catch (error) {
      console.error('Error fetching directions:', error);
      throw error;
    }
  }
}

export default new DirectionService();
