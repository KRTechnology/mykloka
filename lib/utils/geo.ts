// Haversine formula to calculate distance between two points
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Return distance in kilometers
  return distance;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

export function isWithinOfficeRadius(
  userLat: number,
  userLong: number,
  officeLat: number,
  officeLong: number,
  radiusInMeters: number = 750 // Default: 750 meters
): boolean {
  // Calculate distance in kilometers
  const distanceInKm = calculateDistance(
    userLat,
    userLong,
    officeLat,
    officeLong
  );
  // Convert radius from meters to kilometers
  const radiusInKm = radiusInMeters / 1000;
  return distanceInKm <= radiusInKm;
}
