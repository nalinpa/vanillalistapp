import { router, Href } from "expo-router";

/**
 * __Locations__
 */
export function go__Locations__Home() {
  router.replace("/(tabs)/__locations__");
}

export function go__Locations__List() {
  router.replace("/(app)/(tabs)/__locations__/index");
}

export function go__Location__(locationId: string) {
  router.push(`/(tabs)/__locations__/${locationId}` as Href);
}

export function go__Location__Reviews(__location__Id: string, __location__Name?: string) {
  router.push({
    pathname: `/(tabs)/__locations__/${__location__Id}/reviews` as any,
    params: __location__Name ? { __location__Name } : {},
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