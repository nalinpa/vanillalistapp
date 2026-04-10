import { useMemo } from "react";
import { useAppData } from "@/lib/providers/DataProvider";
import { useLocation } from "@/lib/providers/LocationProvider";
import { nearestCheckpoint } from "@/lib/checkpoints";

export function useNearestCheckpoint(locationId: string) {
  const { locationsData } = useAppData();
  const { location: userLoc } = useLocation();

  return useMemo(() => {
    // 1. Find the location object
    const targetLocation = locationsData?.locations?.find((loc) => loc.id === locationId);

    // 2. Safety check for user's GPS and target data
    if (!targetLocation || !userLoc) return { targetLocation, nearest: null };

    // 3. Run your existing calculation
    const nearest = nearestCheckpoint(targetLocation, userLoc.coords.latitude, userLoc.coords.longitude);

    return { targetLocation, nearest };
  }, [locationsData?.locations, locationId, userLoc]);
}