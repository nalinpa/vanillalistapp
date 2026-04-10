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
import type { Location } from "@/lib/models";

export type CompletionMeta = {
  id: string;
  locationId: string;
  isShared: boolean;
  completedAtMs: number | null;
};

export const completionService = {
  // ===============================
  // Complete Location
  // ===============================
  async completeLocation(args: {
    uid: string;
    location: Location;
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
    const { uid, location, loc, gate } = args;

    if (!uid) return { ok: false, err: "Missing uid" };
    if (!location?.id) return { ok: false, err: "Missing location" };
    if (!gate?.inRange) return { ok: false, err: "Not in range" };

    const completionId = `${uid}_${location.id}`;
    // Ensure COL.locationCompletions exists in your constants
    const ref = doc(db, COL.locationCompletions, completionId);

    const completionData = {
      locationId: location.id,
      locationSlug: location.slug ?? "",
      locationName: location.name ?? "",
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
      return { ok: false, err: e?.message ?? "Failed to complete location" };
    }
  },

  // ===============================
  // Confirm Share
  // ===============================
  async confirmShare(args: {
    uid: string;
    locationId: string;
    platform: string | null;
  }) {
    const { uid, locationId, platform } = args;

    if (!uid) return { ok: false, err: "Missing uid" };
    if (!locationId) return { ok: false, err: "Missing locationId" };

    const completionId = `${uid}_${locationId}`;
    const ref = doc(db, COL.locationCompletions, completionId);

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