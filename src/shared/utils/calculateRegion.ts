export const calculateRegion = (lat: number, lng: number): string =>
  Buffer.from(`${Math.floor(lat * 10)}-${Math.floor(lng * 10)}`).toString(
    "base64",
  );
