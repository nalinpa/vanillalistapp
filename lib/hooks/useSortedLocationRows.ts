import { useMemo, useRef } from "react";
import type { LocationObject } from "expo-location";

import type { Location } from "@/lib/models";
import { nearestCheckpoint } from "@/lib/checkpoints";

export type LocationRow = {
  location: Location;
  distanceMeters: number | null;
};

export function useSortedLocationRows(
  locations: Location[],
  userLoc: LocationObject | null,
) {
  // Store the last valid location in a Ref so it survives 'null' flickers
  const lastValidLoc = useRef<LocationObject | null>(null);

  if (userLoc) {
    lastValidLoc.current = userLoc;
  }

  return useMemo<LocationRow[]>(() => {
    // Use the current location, or fall back to the last known one
    const activeLoc = userLoc || lastValidLoc.current;

    // Only if we have NO location whatsoever do we do Name Sort
    if (!activeLoc) {
      return [...locations]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((location) => ({ location, distanceMeters: null }));
    }

    const { latitude, longitude } = activeLoc.coords;

    const rows = locations.map((location) => ({
      location,
      distanceMeters: nearestCheckpoint(location, latitude, longitude).distanceMeters,
    }));

    rows.sort((a, b) => {
      // Primary Sort: Distance (Ascending)
      // Secondary Sort: Name (Alphabetical)
      if (a.distanceMeters == null && b.distanceMeters == null)
        return a.location.name.localeCompare(b.location.name);
      if (a.distanceMeters == null) return 1;
      if (b.distanceMeters == null) return -1;
      
      if (a.distanceMeters !== b.distanceMeters)
        return a.distanceMeters - b.distanceMeters;
      
      return a.location.name.localeCompare(b.location.name);
    });

    return rows;
  }, [locations, userLoc]);
}