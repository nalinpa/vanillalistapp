import type { Region } from "react-native-maps";

// TODO: Update to your new application's default center (epicenter)
const DEFAULT_CENTER = {
  latitude: -36.8485,
  longitude: 174.7633,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export function initialRegionFrom(
  userLat: number | null,
  userLng: number | null,
  __locations__: { lat: number; lng: number }[],
): Region {
  // 1. Priority: User location (Zoomed in closer)
  if (userLat != null && userLng != null) {
    return {
      latitude: userLat,
      longitude: userLng,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }

  // 2. Fallback: Center of all __locations__
  if (__locations__.length > 0) {
    // We calculate the min/max to find the true geographic center
    let minLat = __locations__[0].lat;
    let maxLat = __locations__[0].lat;
    let minLng = __locations__[0].lng;
    let maxLng = __locations__[0].lng;

    for (const loc of __locations__) {
      if (loc.lat < minLat) minLat = loc.lat;
      if (loc.lat > maxLat) maxLat = loc.lat;
      if (loc.lng < minLng) minLng = loc.lng;
      if (loc.lng > maxLng) maxLng = loc.lng;
    }

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.2, 0.12),
      longitudeDelta: Math.max((maxLng - minLng) * 1.2, 0.12),
    };
  }

  // 3. Ultimate Fallback: Default Center
  return DEFAULT_CENTER;
}