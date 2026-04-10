import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  onSnapshot,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";
import { useSyncStore } from "@/lib/store/useSyncStore"; // 🚀 IMPORT THE ZUSTAND STORE

function toMs(v: any): number {
  if (!v) return 0;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  return 0;
}

const defaultState = {
  completedLocationIds: new Set<string>(),
  pendingLocationIds: new Set<string>(),
  completedAtByLocationId: {} as Record<string, number>,
  completions: [] as any[],
};

export function useMyCompletions() {
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;
  const queryClient = useQueryClient();

  // 🚀 GRAB THE OFFLINE QUEUE FROM ZUSTAND
  const syncQueue = useSyncStore((state) => state.queue);

  useEffect(() => {
    if (!uid) return;

    // Make sure COL.locationCompletions exists in your constants
    const q = query(collection(db, COL.locationCompletions), where("userId", "==", uid));

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snap) => {
        const completedLocationIds = new Set<string>();
        const pendingLocationIds = new Set<string>();
        const completedAtByLocationId: Record<string, number> = {};
        const completions: any[] = [];

        snap.forEach((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const d = doc.data() as any;
          const locationId = d.locationId;
          if (!locationId) return;

          completedLocationIds.add(locationId);
          completedAtByLocationId[locationId] = toMs(d.completedAt);

          if (doc.metadata.hasPendingWrites) {
            pendingLocationIds.add(locationId);
          }

          completions.push({ id: doc.id, ...d });
        });

        queryClient.setQueryData(["myCompletions", uid], {
          completedLocationIds,
          pendingLocationIds,
          completedAtByLocationId,
          completions,
        });
      },
      (error) => {
        Sentry.captureException(error, {
          tags: { hook: "useMyCompletions" },
          extra: { uid },
        });
      },
    );

    return () => unsubscribe();
  }, [uid, queryClient]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["myCompletions", uid],
    queryFn: () => defaultState,
    initialData: defaultState,
    enabled: false, // Relies entirely on the snapshot listener to populate the cache
  });

  const state = (data as typeof defaultState) || defaultState;

  const mergedState = useMemo(() => {
    const finalCompletedIds = new Set(state.completedLocationIds);
    const finalPendingIds = new Set(state.pendingLocationIds);

    // Inject everything sitting in the offline queue into the UI's reality
    syncQueue.forEach((item) => {
      // Make sure the items in your SyncStore queue now use `location.id`
      if (item?.location?.id) {
        finalCompletedIds.add(item.location.id);
        finalPendingIds.add(item.location.id);
      }
    });

    return {
      ...state,
      completedLocationIds: finalCompletedIds,
      pendingLocationIds: finalPendingIds,
    };
  }, [state, syncQueue]);

  return {
    loading: session.status === "loading" || isLoading,
    err: error instanceof Error ? error.message : "",
    ...mergedState, // 🚀 Return the merged state so the UI sees everything
  };
}