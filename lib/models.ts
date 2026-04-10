export type __Location__Category = "type_a" | "type_b" | "type_c" | "other";
export type __Location__Region = "north" | "south" | "east" | "west" | "central";

export type Checkpoint = {
  id?: string; // stable string (recommended)
  label?: string; // user-friendly name
  lat: number;
  lng: number;
  radiusMeters: number;
};

export type __Location__ = {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  checkpoints?: Checkpoint[];
  description: string;
  active: boolean;
  category: __Location__Category;
  region: __Location__Region;
};

export type __Location__CompletionWrite = {
  __location__Id: string;
  __location__Slug: string;
  __location__Name: string;
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

export type __Location__ReviewWrite = {
  __location__Id: string;
  __location__Slug: string;
  __location__Name: string;
  userId: string;

  reviewRating: number; // 1–5
  reviewText: string | null;
  reviewCreatedAt: any; // serverTimestamp()
};

export type CompletionMeta = {
  id: string;
  __location__Id: string;
  isShared: boolean;
  completedAtMs: number | null;
};