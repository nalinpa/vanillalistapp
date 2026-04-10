import {
  doc,
  serverTimestamp,
  updateDoc,
  setDoc,
} from "@react-native-firebase/firestore";
import type { LocationObject } from "expo-location";
import * as Sentry from "@sentry/react-native";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import type { __Location__ } from "@/lib/models";

export type CompletionMeta = {
  id: string;
  __location__Id: string;
  isShared: boolean;
  completedAtMs: number | null;
};

export const completionService = {
  // ===============================
  // Complete __Location__
  // ===============================
  async complete__Location__(args: {
    uid: string;
    __location__: __Location__;
    loc: LocationObject;
    gate: {
      inRange: boolean;
      distanceMeters: number | null;
      checkpointId: string | null;
      checkpointLabel: string | null;
      checkpointLat: number | null;
      checkpointLng: number | null;
      checkpointRadius: number | null;
    };
  }) {
    const { uid, __location__, loc, gate } = args;

    if (!uid) return { ok: false, err: "Missing uid" };
    if (!__location__?.id) return { ok: false, err: "Missing __location__" };
    if (!gate?.inRange) return { ok: false, err: "Not in range" };

    const completionId = `${uid}_${__location__.id}`;
    // Ensure COL.__location__Completions exists in your constants
    const ref = doc(db, COL.__location__Completions, completionId);

    const completionData = {
      __location__Id: __location__.id,
      __location__Slug: __location__.slug ?? "",
      __location__Name: __location__.name ?? "",
      userId: uid,
      completedAt: serverTimestamp(),
      accuracyMeters: loc.coords.accuracy ?? null,
      distanceMeters: gate.distanceMeters ?? null,
      checkpointId: gate.checkpointId ?? null,
      checkpointLabel: gate.checkpointLabel ?? null,
      checkpointLat: gate.checkpointLat ?? null,
      checkpointLng: gate.checkpointLng ?? null,
      checkpointRadiusMeters: gate.checkpointRadius ?? null,
      checkpointDistanceMeters: gate.distanceMeters ?? null,
      isShared: false,
      shareConfirmed: false,
      sharedAt: null,
      sharedPlatform: null,
    };

    try {
      // If Firebase hangs, we force a rejection so the offline queue unlocks.
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("FIREBASE_TIMEOUT")), 8000);
      });

      const writePromise = setDoc(ref, completionData, { merge: true });

      // Race Firebase against our timeout clock
      await Promise.race([writePromise, timeoutPromise]);

      return { ok: true };
    } catch (e: any) {
      if (e.message !== "FIREBASE_TIMEOUT") {
        Sentry.captureException(e); // Only log to Sentry if it's a real crash, not a timeout
      }
      return { ok: false, err: e?.message ?? "Failed to complete __location__" };
    }
  },

  // ===============================
  // Confirm Share
  // ===============================
  async confirmShare(args: {
    uid: string;
    __location__Id: string;
    platform: string | null;
  }) {
    const { uid, __location__Id, platform } = args;

    if (!uid) return { ok: false, err: "Missing uid" };
    if (!__location__Id) return { ok: false, err: "Missing __location__Id" };

    const completionId = `${uid}_${__location__Id}`;
    const ref = doc(db, COL.__location__Completions, completionId);

    try {
      await updateDoc(ref, {
        isShared: true,
        shareConfirmed: true,
        sharedAt: serverTimestamp(),
        sharedPlatform: platform ?? "share-sheet",
        updatedAt: serverTimestamp(),
      });

      return { ok: true };
    } catch (e: any) {
      Sentry.captureException(e);
      return { ok: false, err: e?.message ?? "Failed to confirm share" };
    }
  },
};