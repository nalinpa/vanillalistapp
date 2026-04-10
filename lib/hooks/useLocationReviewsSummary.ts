import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";
import { doc, getDoc } from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { reviewService } from "@/lib/services/reviewService";
import { useSession } from "@/lib/providers/SessionProvider";

/**
 * Fetcher for the __Location__'s overall stats (average rating, count).
 */
async function fetch__Location__Stats(__location__Id: string) {
  const ref = doc(db, COL.__locations__, __location__Id);
  const snap = await getDoc(ref);

  return snap.exists() ? (snap.data() ?? null) : null;
}

/**
 * Fetcher for the user's specific review for this __location__.
 */
async function fetchMyReview(uid: string, __location__Id: string) {
  const reviewId = `${uid}_${__location__Id}`;

  const ref = doc(db, COL.__location__Reviews, reviewId);
  const snap = await getDoc(ref);

  // Defensive check: force undefined data to null
  return snap.exists() ? (snap.data() ?? null) : null;
}

export function use__Location__ReviewsSummary(__location__Id: string | null | undefined) {
  const { session } = useSession();
  const queryClient = useQueryClient();

  const uid = session.status === "authed" ? session.uid : null;
  const userName = auth().currentUser?.displayName || "Unknown User";

  const {
    data: __location__Data,
    isLoading: __location__Loading,
    error: __location__Error,
  } = useQuery({
    queryKey: ["__location__", __location__Id],
    queryFn: () => fetch__Location__Stats(__location__Id!),
    enabled: !!__location__Id,
  });

  const {
    data: reviewData,
    isLoading: reviewLoading,
    error: reviewError,
  } = useQuery({
    queryKey: ["__location__Review", uid, __location__Id],
    queryFn: () => fetchMyReview(uid!, __location__Id!),
    enabled: !!uid && !!__location__Id,
  });

  // Mutation: Saving or Updating a Review
  const mutation = useMutation({
    mutationFn: async (args: Parameters<typeof reviewService.saveReview>[0]) => {
      const res = await reviewService.saveReview(args);
      if (!res.ok) throw new Error(res.err || "Failed to save review");
      return res;
    },
    onSuccess: (_, args) => {
      // Refresh user review, __location__ stats, and global app data
      // @ts-ignore - Assuming args.__location__Id will be updated in your reviewService types
      queryClient.invalidateQueries({ queryKey: ["__location__Review", uid, args.__location__Id] });
      // @ts-ignore
      queryClient.invalidateQueries({ queryKey: ["__location__", args.__location__Id] });
      queryClient.invalidateQueries({ queryKey: ["appData"] });
    },
  });

  const avgRating = __location__Data?.avgRating ?? null;
  const ratingCount = __location__Data?.ratingCount ?? 0;
  const myRating = reviewData?.rating ?? reviewData?.reviewRating ?? null;
  const myText = reviewData?.text ?? reviewData?.reviewText ?? null;

  const loading = session.status === "loading" || __location__Loading || reviewLoading;
  const err =
    (__location__Error instanceof Error ? __location__Error.message : null) ??
    (reviewError instanceof Error ? reviewError.message : null);

  const saveReview = async (args: {
    __location__Id?: string | null;
    __location__Slug: string;
    __location__Name: string;
    reviewRating: number | null | undefined;
    reviewText: string | null | undefined;
  }) => {
    const target__Location__Id = args.__location__Id || __location__Id;

    if (session.status === "loading")
      return { ok: false as const, err: "Session not ready" };
    if (session.status !== "authed")
      return { ok: false as const, err: "You must be logged in" };
    if (!target__Location__Id) return { ok: false as const, err: "Missing __location__Id" };

    try {
      await mutation.mutateAsync({
        ...args,
        uid: uid!,
        userName: userName,
        __location__Id: target__Location__Id, 
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