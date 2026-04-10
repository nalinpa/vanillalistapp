import { useMemo, useRef } from "react";
import type { LocationObject } from "expo-location";

import type { __Location__ } from "@/lib/models";
import { nearestCheckpoint } from "@/lib/checkpoints";

export type __Location__Row = {
  __location__: __Location__;
  distanceMeters: number | null;
};

export function useSorted__Location__Rows(
  __locations__: __Location__[],
  userLoc: LocationObject | null,
) {
  // Store the last valid location in a Ref so it survives 'null' flickers
  const lastValidLoc = useRef<LocationObject | null>(null);

  if (userLoc) {
    lastValidLoc.current = userLoc;
  }

  return useMemo<__Location__Row[]>(() => {
    // Use the current location, or fall back to the last known one
    const activeLoc = userLoc || lastValidLoc.current;

    // Only if we have NO location whatsoever do we do Name Sort
    if (!activeLoc) {
      return [...____location__s__]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((__location__) => ({ __location__, distanceMeters: null }));
    }

    const { latitude, longitude } = activeLoc.coords;

    const rows = ____location__s__.map((__location__) => ({
      __location__,
      distanceMeters: nearestCheckpoint(__location__, latitude, longitude).distanceMeters,
    }));

    rows.sort((a, b) => {
      // Primary Sort: Distance (Ascending)
      // Secondary Sort: Name (Alphabetical)
      if (a.distanceMeters == null && b.distanceMeters == null)
        return a.__location__.name.localeCompare(b.__location__.name);
      if (a.distanceMeters == null) return 1;
      if (b.distanceMeters == null) return -1;
      
      if (a.distanceMeters !== b.distanceMeters)
        return a.distanceMeters - b.distanceMeters;
      
      return a.__location__.name.localeCompare(b.__location__.name);
    });

    return rows;
  }, [____location__s__, userLoc]);
}