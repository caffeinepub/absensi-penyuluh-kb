/**
 * Haversine distance calculation between two lat/lon points.
 * Returns distance in meters.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface GpsCheckResult {
  allowed: boolean;
  reason: "ok" | "fake_gps" | "out_of_range" | "no_location" | "no_kecamatan";
  distanceMeters?: number;
}

/**
 * Detects potential fake GPS by checking:
 * 1. accuracy is suspiciously perfect (< 3m usually means mocked GPS)
 * 2. speed is 0 and altitude is exactly 0 (common mock defaults)
 * 3. altitudeAccuracy is 0 (impossible for real GPS)
 */
export function isFakeGps(position: GeolocationPosition): boolean {
  const { accuracy, altitudeAccuracy, altitude } = position.coords;

  // Perfect accuracy < 2m is almost impossible without spoofing
  if (accuracy < 2) return true;

  // altitudeAccuracy === 0 is a common fake GPS indicator
  if (altitudeAccuracy !== null && altitudeAccuracy === 0) return true;

  // altitude exactly 0 combined with very high accuracy
  if (altitude === 0 && accuracy < 10) return true;

  return false;
}

export const GPS_RADIUS_METERS = 300;
