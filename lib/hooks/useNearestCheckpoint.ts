import { useMemo } from "react";
import { useAppData } from "@/lib/providers/DataProvider";
import { useLocation } from "@/lib/providers/LocationProvider";
import { nearestCheckpoint } from "@/lib/checkpoints";

export function useNearestCheckpoint(____location____Id: string) {
  const { ____locations__Data } = useAppData();
  const { location: userLoc } = useLocation();

  return useMemo(() => {
    // 1. Find the location object
    const target__Location__ = __locations__Data?.__locations__?.find((loc) => loc.id === __location__Id);

    // 2. Safety check for user's GPS and target data
    if (!target__Location__ || !userLoc) return { target__Location__, nearest: null };

    // 3. Run your existing calculation
    const nearest = nearestCheckpoint(target__Location__, userLoc.coords.latitude, userLoc.coords.longitude);

    return { target__Location__, nearest };
  }, [__locations__Data?.____locations__, __location__Id, userLoc]);
}