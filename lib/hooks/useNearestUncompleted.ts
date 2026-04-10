import { useMemo } from "react";
import type { LocationObject } from "expo-location";

import type { Location } from "@/lib/models";
import { nearestCheckpoint } from "@/lib/checkpoints";

export type NearestUncompletedResult = {
  location: Location;
  distanceMeters: number | null;
};

export function useNearestUncompleted(
  locations: Location[],
  completedLocationIds: Set<string>,
  userLoc: LocationObject | null,
): NearestUncompletedResult | null {
  return useMemo(() => {
    const uncompleted = locations.filter((loc) => !completedLocationIds.has(loc.id));
    if (uncompleted.length === 0) return null;

    // Stable fallback when no device location: alphabetically first
    if (!userLoc) {
      const sorted = [...uncompleted].sort((a, b) => a.name.localeCompare(b.name));
      return { location: sorted[0], distanceMeters: null };
    }

    const { latitude, longitude } = userLoc.coords;

    let best = uncompleted[0];
    let bestDist = nearestCheckpoint(best, latitude, longitude).distanceMeters;

    for (let i = 1; i < uncompleted.length; i++) {
      const locItem = uncompleted[i];
      const d = nearestCheckpoint(locItem, latitude, longitude).distanceMeters;
      
      // Safety check in case nearestCheckpoint returns null/undefined for distance
      if (d !== null && (bestDist === null || d < bestDist)) {
        best = locItem;
        bestDist = d;
      }
    }

    return { location: best, distanceMeters: bestDist };
  }, [locations, completedLocationIds, userLoc]);
}