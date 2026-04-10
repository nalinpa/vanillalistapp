import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";
import { doc, getDoc } from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { reviewService } from "@/lib/services/reviewService";
import { useSession } from "@/lib/providers/SessionProvider";

/**
 * Fetcher for the Location's overall stats (average rating, count).
 */
async function fetchLocationStats(locationId: string) {
  const ref = doc(db, COL.locations, locationId);
  const snap = await getDoc(ref);

  return snap.exists() ? (snap.data() ?? null) : null;
}

/**
 * Fetcher for the user's specific review for this location.
 */
async function fetchMyReview(uid: string, locationId: string) {
  const reviewId = `${uid}_${locationId}`;

  const ref = doc(db, COL.locationReviews, reviewId);
  const snap = await getDoc(ref);

  // Defensive check: force undefined data to null
  return snap.exists() ? (snap.data() ?? null) : null;
}

export function useLocationReviewsSummary(locationId: string | null | undefined) {
  const { session } = useSession();
  const queryClient = useQueryClient();

  const uid = session.status === "authed" ? session.uid : null;
  const userName = auth().currentUser?.displayName || "Unknown User";

  const {
    data: locationData,
    isLoading: locationLoading,
    error: locationError,
  } = useQuery({
    queryKey: ["location", locationId],
    queryFn: () => fetchLocationStats(locationId!),
    enabled: !!locationId,
  });

  const {
    data: reviewData,
    isLoading: reviewLoading,
    error: reviewError,
  } = useQuery({
    queryKey: ["locationReview", uid, locationId],
    queryFn: () => fetchMyReview(uid!, locationId!),
    enabled: !!uid && !!locationId,
  });

  // Mutation: Saving or Updating a Review
  const mutation = useMutation({
    mutationFn: async (args: Parameters<typeof reviewService.saveReview>[0]) => {
      const res = await reviewService.saveReview(args);
      if (!res.ok) throw new Error(res.err || "Failed to save review");
      return res;
    },
    onSuccess: (_, args) => {
      // Refresh user review, location stats, and global app data
      // @ts-ignore - Assuming args.locationId will be updated in your reviewService types
      queryClient.invalidateQueries({ queryKey: ["locationReview", uid, args.locationId] });
      // @ts-ignore
      queryClient.invalidateQueries({ queryKey: ["location", args.locationId] });
      queryClient.invalidateQueries({ queryKey: ["appData"] });
    },
  });

  const avgRating = locationData?.avgRating ?? null;
  const ratingCount = locationData?.ratingCount ?? 0;
  const myRating = reviewData?.rating ?? reviewData?.reviewRating ?? null;
  const myText = reviewData?.text ?? reviewData?.reviewText ?? null;

  const loading = session.status === "loading" || locationLoading || reviewLoading;
  const err =
    (locationError instanceof Error ? locationError.message : null) ??
    (reviewError instanceof Error ? reviewError.message : null);

  const saveReview = async (args: {
    locationId?: string | null;
    locationSlug: string;
    locationName: string;
    reviewRating: number | null | undefined;
    reviewText: string | null | undefined;
  }) => {
    const targetLocationId = args.locationId || locationId;

    if (session.status === "loading")
      return { ok: false as const, err: "Session not ready" };
    if (session.status !== "authed")
      return { ok: false as const, err: "You must be logged in" };
    if (!targetLocationId) return { ok: false as const, err: "Missing locationId" };

    try {
      await mutation.mutateAsync({
        ...args,
        uid: uid!,
        userName: userName,
        // Using as any here temporarily in case your reviewService still expects coneId. 
        // Be sure to update reviewService.saveReview signature!
        locationId: targetLocationId, 
      } as any);
      return { ok: true as const };
    } catch (e: any) {
      Sentry.captureException(e);
      return { ok: false as const, err: e.message };
    }
  };

  return {
    avgRating,
    ratingCount,
    myRating,
    myText,
    loading,
    err,
    saving: mutation.isPending,
    saveReview,
  };
}