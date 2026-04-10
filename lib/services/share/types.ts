export type ShareLocationPayload = {
  locationId: string;
  locationName: string;
  completedAtMs?: number; // optional
  userPhotoUri?: string; // for future use
};

export type ShareResult =
  | { ok: true; mode: "image" | "text"; shared: true }
  | { ok: false; mode: "image" | "text"; error: string };