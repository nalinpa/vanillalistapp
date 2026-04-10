export type Share__Location__Payload = {
  __location__Id: string;
  __location__Name: string;
  completedAtMs?: number; // optional
  userPhotoUri?: string; // for future use
};

export type ShareResult =
  | { ok: true; mode: "image" | "text"; shared: true }
  | { ok: false; mode: "image" | "text"; error: string };