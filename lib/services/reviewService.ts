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
  __location__Id: string;
  __location__Name?: string;
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
    __location__Id: String(data.__location__Id ?? ""),
    __location__Name: typeof data.__location__Name === "string" ? data.__location__Name : undefined,
    reviewRating: clampRatingRequired(data.reviewRating),
    reviewText: cleanText(data.reviewText, 280),
    reviewCreatedAt: data.reviewCreatedAt ?? null,
  };
}

export const reviewService = {
  async getPublic__Location__Reviews(__location__Id: string): Promise<PublicReview[]> {
    if (!__location__Id) throw new Error("Missing __location__Id.");

    // Ensure COL.__location__Reviews exists in your constants
    const qy = query(
      collection(db, COL.__location__Reviews),
      where("__location__Id", "==", String(__location__Id)),
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
    __location__Id: string;
    __location__Slug: string;
    __location__Name: string;
    reviewRating: number | null | undefined;
    reviewText: string | null | undefined;
  }): Promise<{ ok: true } | { ok: false; err: string }> {
    const { uid, __location__Id } = args;

    if (!uid) return { ok: false, err: "You must be logged in" };
    if (!__location__Id) return { ok: false, err: "Missing __location__Id" };

    const rating = clampRating(args.reviewRating);
    const text = cleanText(args.reviewText, 280);

    if (rating == null) return { ok: false, err: "Pick a rating (1–5)." };

    const reviewId = `${uid}_${String(__location__Id)}`;
    const reviewRef = doc(db, COL.__location__Reviews, reviewId);
    const __location__Ref = doc(db, COL.__locations__, String(__location__Id));

    try {
      await runTransaction(db, async (tx) => {
        // 1. Read __Location__ (for aggregates)
        const __location__Snap = await tx.get(__location__Ref);
        if (!__location__Snap.exists()) throw new Error("__Location__ not found");

        // 2. Read Review (to check for update vs create)
        const reviewSnap = await tx.get(reviewRef);
        const existing = reviewSnap.exists() ? reviewSnap.data() : null;

        // 3. Calculate Aggregates
        const __location__Data = __location__Snap.data()!;
        let count = (__location__Data.ratingCount || 0) as number;
        let sum = (__location__Data.ratingSum || 0) as number;
        const currentAvg = (__location__Data.avgRating || 0) as number;

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
            __location__Id: String(__location__Id),
            __location__Slug: String(args.__location__Slug ?? ""),
            __location__Name: String(args.__location__Name ?? ""),
            userId: uid,
            userName: args.userName ? String(args.userName) : "Unknown User", 
            reviewRating: rating,
            reviewText: text ?? null,
            reviewCreatedAt: existing?.reviewCreatedAt ?? serverTimestamp(),
            reviewUpdatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        // 5. Update __Location__
        tx.update(__location__Ref, {
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