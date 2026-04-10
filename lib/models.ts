export type LocationCategory = "type_a" | "type_b" | "type_c" | "other";
export type LocationRegion = "north" | "south" | "east" | "west" | "central";

export type Checkpoint = {
  id?: string; // stable string (recommended)
  label?: string; // user-friendly name
  lat: number;
  lng: number;
  radiusMeters: number;
};

export type Location = {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  checkpoints?: Checkpoint[];
  description: string;
  active: boolean;
  category: LocationCategory;
  region: LocationRegion;
};

export type LocationCompletionWrite = {
  locationId: string;
  locationSlug: string;
  locationName: string;
  userId: string;

  completedAt: any;
  accuracyMeters: number | null;

  // Distance to nearest checkpoint (or fallback).
  // Kept for back-compat because the UI uses it in multiple places.
  distanceMeters: number;

  // Checkpoint details (optional in Firestore, but we write them when completing)
  checkpointId?: string | null;
  checkpointLabel?: string | null;
  checkpointLat?: number | null;
  checkpointLng?: number | null;
  checkpointRadiusMeters?: number | null;
  checkpointDistanceMeters?: number | null;

  // Share tracking fields
  isShared: boolean;
  shareConfirmed: boolean;
  sharedAt: any;
  sharedPlatform: string | null;
};

export type LocationReviewWrite = {
  locationId: string;
  locationSlug: string;
  locationName: string;
  userId: string;

  reviewRating: number; // 1–5
  reviewText: string | null;
  reviewCreatedAt: any; // serverTimestamp()
};

export type CompletionMeta = {
  id: string;
  locationId: string;
  isShared: boolean;
  completedAtMs: number | null;
};