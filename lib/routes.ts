import { router, Href } from "expo-router";

/**
 * Locations
 */
export function goLocationsHome() {
  router.replace("/(tabs)/locations");
}

export function goLocationsList() {
  router.replace("/(app)/(tabs)/locations/index");
}

export function goLocation(locationId: string) {
  router.push(`/(tabs)/locations/${locationId}` as Href);
}

export function goLocationReviews(locationId: string, locationName?: string) {
  router.push({
    pathname: `/(tabs)/locations/${locationId}/reviews` as any,
    params: locationName ? { locationName } : {},
  });
}

/**
 * Progress
 */
export function goProgressHome() {
  router.replace("/(tabs)/progress");
}

export function goBadges() {
  router.push("/(tabs)/progress/badges");
}

/**
 * Map
 */
export function goMapHome() {
  router.replace("/(tabs)/map");
}

/**
 * Auth
 */
export function goLogin() {
  router.replace("/login");
}

export function goAccountHome() {
  router.push("/(tabs)/account");
}