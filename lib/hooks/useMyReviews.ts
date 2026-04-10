import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "@react-native-firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";

function toMs(v: any): number {
  if (!v) return 0;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  const parsed = Date.parse(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

const EMPTY_IDS = new Set<string>();

async function fetchMyReviews(uid: string) {
  // Ensure COL.locationReviews exists in your constants
  const qy = query(collection(db, COL.__location__Reviews), where("userId", "==", uid));

  const snap = await getDocs(qy);

  const ids = new Set<string>();
  const atBy__Location__: Record<string, number> = Object.create(null);

  for (const d of snap.docs) {
    const val = d.data();
    const __location__Id = typeof val?.__location__Id === "string" ? val.__location__Id : null;
    if (!__location__Id) continue;

    ids.add(__location__Id);

    const t = toMs(val?.reviewCreatedAt);
    if (t > 0) {
      const prev = atBy__Location__[__location__Id] ?? 0;
      atBy__Location__[__location__Id] = prev > 0 ? Math.min(prev, t) : t;
    }
  }

  return {
    reviewed__Location__Ids: ids,
    reviewCount: ids.size,
    reviewedAtBy__Location__Id: atBy__Location__,
  };
}

export function useMyReviews(): {
  loading: boolean;
  err: string;
  reviewed__Location__Ids: Set<string>;
  reviewCount: number;
  reviewedAtBy__Location__Id: Record<string, number>;
} {
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["myReviews", uid],
    queryFn: () => fetchMyReviews(uid!),
    enabled: !!uid, // Only fetch if user is logged in
  });

  const defaultState = {
    reviewed__Location__Ids: EMPTY_IDS,
    reviewCount: 0,
    reviewedAtBy__Location__Id: {},
  };

  const state = data || defaultState;

  return {
    loading: session.status === "loading" || isLoading,
    err: error instanceof Error ? error.message : "",
    ...state, 
  };
}