import { useMemo } from "react";
import type * as Location from "expo-location";

import type { __ENTITY__ } from "@/lib/models";
import { nearestCheckpoint } from "@/lib/checkpoints";
import { GAMEPLAY } from "../constants/gameplay";

export function useGPSGate(
  entity: __ENTITY__ | null,
  loc: Location.LocationObject | null,
  opts?: { maxAccuracyMeters?: number },
): {
  distanceMeters: number | null;
  accuracyMeters: number | null;
  inRange: boolean;

  checkpointLabel: string | null;
  checkpointRadius: number | null;
  checkpointId: string | null;

  // useful for completion writes
  checkpointLat: number | null;
  checkpointLng: number | null;
} {
  const maxAccuracy = opts?.maxAccuracyMeters ?? GAMEPLAY.MAX_GPS_ACCURACY_METERS;

  return useMemo(() => {
    if (!entity || !loc) {
      return {
        distanceMeters: null,
        accuracyMeters: null,
        inRange: false,
        checkpointLabel: null,
        checkpointRadius: null,
        checkpointId: null,
        checkpointLat: null,
        checkpointLng: null,
      };
    }

    const { latitude, longitude, accuracy } = loc.coords;
    const nearest = nearestCheckpoint(entity, latitude, longitude);

    const distanceMeters = nearest.distanceMeters;
    const accuracyMeters = accuracy ?? null;

    const okAccuracy = accuracyMeters == null || accuracyMeters <= maxAccuracy;
    const inRange = distanceMeters <= nearest.checkpoint.radiusMeters && okAccuracy;

    return {
      distanceMeters,
      accuracyMeters,
      inRange,

      checkpointLabel: nearest.checkpoint.label ?? null,
      checkpointRadius: nearest.checkpoint.radiusMeters ?? null,
      checkpointId: nearest.checkpoint.id ?? null,

      checkpointLat: nearest.checkpoint.lat ?? null,
      checkpointLng: nearest.checkpoint.lng ?? null,
    };
  }, [entity, loc, maxAccuracy]);
}