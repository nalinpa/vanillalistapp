import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  runTransaction,
  where,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";

export type PublicReview = {
  id: string;
  userId: string;
  userName?: string;
  locationId: string;
  locationName?: string;
  reviewRating: number; // 1..5
  reviewText?: string | null;
  reviewCreatedAt?: any;
};

function clampRating(n: any): number | null {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  const r = Math.round(v);
  if (r < 1) return 1;
  if (r > 5) return 5;
  return r;
}

function clampRatingRequired(n: any): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 1;
  const r = Math.round(v);
  if (r < 1) return 1;
  if (r > 5) return 5;
  return r;
}

function cleanText(t: any, maxLen = 280): string | null {
  if (typeof t !== "string") return null;
  const s = t.trim();
  if (!s) return null;
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function round1dp(n: number): number {
  return Math.round(n * 10) / 10;
}

function mapPublicReview(id: string, data: any): PublicReview {
  return {
    id,
    userId: String(data.userId ?? ""),
    userName: typeof data.userName === "string" ? data.userName : "this user", 
    locationId: String(data.locationId ?? ""),
    locationName: typeof data.locationName === "string" ? data.locationName : undefined,
    reviewRating: clampRatingRequired(data.reviewRating),
    reviewText: cleanText(data.reviewText, 280),
    reviewCreatedAt: data.reviewCreatedAt ?? null,
  };
}

export const reviewService = {
  async getPublicLocationReviews(locationId: string): Promise<PublicReview[]> {
    if (!locationId) throw new Error("Missing locationId.");

    // Ensure COL.locationReviews exists in your constants
    const qy = query(
      collection(db, COL.locationReviews),
      where("locationId", "==", String(locationId)),
      orderBy("reviewCreatedAt", "desc"),
    );

    const snap = await getDocs(qy);

    return snap.docs.map((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) =>
      mapPublicReview(d.id, d.data()),
    );
  },

  async saveReview(args: {
    uid: string | null | undefined; 
    userName: string | null | undefined; 
    locationId: string;
    locationSlug: string;
    locationName: string;
    reviewRating: number | null | undefined;
    reviewText: string | null | undefined;
  }): Promise<{ ok: true } | { ok: false; err: string }> {
    const { uid, locationId } = args;

    if (!uid) return { ok: false, err: "You must be logged in" };
    if (!locationId) return { ok: false, err: "Missing locationId" };

    const rating = clampRating(args.reviewRating);
    const text = cleanText(args.reviewText, 280);

    if (rating == null) return { ok: false, err: "Pick a rating (1–5)." };

    const reviewId = `${uid}_${String(locationId)}`;
    const reviewRef = doc(db, COL.locationReviews, reviewId);
    const locationRef = doc(db, COL.locations, String(locationId));

    try {
      await runTransaction(db, async (tx) => {
        // 1. Read Location (for aggregates)
        const locationSnap = await tx.get(locationRef);
        if (!locationSnap.exists()) throw new Error("Location not found");

        // 2. Read Review (to check for update vs create)
        const reviewSnap = await tx.get(reviewRef);
        const existing = reviewSnap.exists() ? reviewSnap.data() : null;

        // 3. Calculate Aggregates
        const locationData = locationSnap.data()!;
        let count = (locationData.ratingCount || 0) as number;
        let sum = (locationData.ratingSum || 0) as number;
        const currentAvg = (locationData.avgRating || 0) as number;

        // Backfill sum if missing (legacy data support)
        if (!sum && count > 0 && currentAvg > 0) {
          sum = Math.round(currentAvg * count);
        }

        const oldRating = existing?.reviewRating ? Number(existing.reviewRating) : null;
        const isUpdate = oldRating != null && Number.isFinite(oldRating);

        if (isUpdate) {
          sum = sum - (oldRating as number) + rating;
        } else {
          sum += rating;
          count += 1;
        }

        const newAvg = count > 0 ? round1dp(sum / count) : 0;

        // 4. Write Review
        tx.set(
          reviewRef,
          {
            locationId: String(locationId),
            locationSlug: String(args.locationSlug ?? ""),
            locationName: String(args.locationName ?? ""),
            userId: uid,
            userName: args.userName ? String(args.userName) : "Unknown User", 
            reviewRating: rating,
            reviewText: text ?? null,
            reviewCreatedAt: existing?.reviewCreatedAt ?? serverTimestamp(),
            reviewUpdatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        // 5. Update Location
        tx.update(locationRef, {
          ratingCount: count,
          ratingSum: sum,
          avgRating: newAvg,
        });
      });

      return { ok: true };
    } catch (e: any) {
      Sentry.captureException(e);
      return { ok: false, err: e?.message ?? "Failed to save review." };
    }
  },
};