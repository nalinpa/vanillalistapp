import { useMemo } from "react";
import type { LocationObject } from "expo-location";

import type { __Location__ } from "@/lib/models";
import { nearestCheckpoint } from "@/lib/checkpoints";

export type NearestUncompletedResult = {
  __location__: __Location__;
  distanceMeters: number | null;
};

export function useNearestUncompleted(
  __locations__: __Location__[],
  completed__Location__Ids: Set<string>,
  userLoc: LocationObject | null,
): NearestUncompletedResult | null {
  return useMemo(() => {
    const uncompleted = __locations__.filter((loc) => !completed__Location__Ids.has(loc.id));
    if (uncompleted.length === 0) return null;

    // Stable fallback when no device location: alphabetically first
    if (!userLoc) {
      const sorted = [...uncompleted].sort((a, b) => a.name.localeCompare(b.name));
      return { __location__: sorted[0], distanceMeters: null };
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

    return { __location__: best, distanceMeters: bestDist };
  }, [__locations__, completed__Location__Ids, userLoc]);
}