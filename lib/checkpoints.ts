import { getDistance, findNearest } from "geolib";

export type Checkpoint = {
  id?: string;
  label?: string;
  lat: number;
  lng: number;
  radiusMeters: number;
};

export type __Location__WithCheckpoints = {
  id: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  checkpoints?: Checkpoint[];
};

export type EffectiveCheckpoint = Checkpoint & {
  id: string;
  label: string;
  source: "checkpoint" | "fallback";
};

export function getEffectiveCheckpoints(
  __location__: __Location__WithCheckpoints,
): EffectiveCheckpoint[] {
  if (__location__.checkpoints && __location__.checkpoints.length > 0) {
    return __location__.checkpoints.map((cp, idx) => ({
      id: cp.id ?? `cp_${idx}`,
      label: cp.label ?? `Checkpoint ${idx + 1}`,
      lat: cp.lat,
      lng: cp.lng,
      radiusMeters: cp.radiusMeters,
      source: "checkpoint" as const,
    }));
  }

  return [
    {
      id: "fallback",
      label: "Main point",
      lat: __location__.lat,
      lng: __location__.lng,
      radiusMeters: __location__.radiusMeters,
      source: "fallback" as const,
    },
  ];
}

export function nearestCheckpoint(
  __location__: __Location__WithCheckpoints,
  deviceLat: number,
  deviceLng: number,
): { checkpoint: EffectiveCheckpoint; distanceMeters: number } {
  const cps = getEffectiveCheckpoints(__location__);
  const userCoords = { latitude: deviceLat, longitude: deviceLng };

  const formattedCps = cps.map((cp) => ({
    ...cp,
    latitude: cp.lat,
    longitude: cp.lng,
  }));

  const nearest = findNearest(userCoords, formattedCps) as (typeof formattedCps)[0];

  const distanceMeters = getDistance(userCoords, nearest);

  return { checkpoint: nearest, distanceMeters };
}

export function inRange(
  checkpoint: { radiusMeters: number },
  distanceMeters: number,
  accuracyMeters: number | null,
  maxAccuracyMeters = 50, // Strict fallback if GPS accuracy is poor
) {
  const okAccuracy = accuracyMeters == null || accuracyMeters <= maxAccuracyMeters;
  return distanceMeters <= checkpoint.radiusMeters && okAccuracy;
}