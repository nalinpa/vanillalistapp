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
  completed__Location__Ids: new Set<string>(),
  pending__Location__Ids: new Set<string>(),
  completedAtBy__Location__Id: {} as Record<string, number>,
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

    // Make sure COL.__location__Completions exists in your constants
    const q = query(collection(db, COL.__location__Completions), where("userId", "==", uid));

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snap) => {
        const completed__Location__Ids = new Set<string>();
        const pending__Location__Ids = new Set<string>();
        const completedAtBy__Location__Id: Record<string, number> = {};
        const completions: any[] = [];

        snap.forEach((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const d = doc.data() as any;
          const __location__Id = d.__location__Id;
          if (!__location__Id) return;

          completed__Location__Ids.add(__location__Id);
          completedAtBy__Location__Id[__location__Id] = toMs(d.completedAt);

          if (doc.metadata.hasPendingWrites) {
            pending__Location__Ids.add(__location__Id);
          }

          completions.push({ id: doc.id, ...d });
        });

        queryClient.setQueryData(["myCompletions", uid], {
          completed__Location__Ids,
          pending__Location__Ids,
          completedAtBy__Location__Id,
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
    const finalCompletedIds = new Set(state.completed__Location__Ids);
    const finalPendingIds = new Set(state.pending__Location__Ids);

    // Inject everything sitting in the offline queue into the UI's reality
    syncQueue.forEach((item) => {
      // Make sure the items in your SyncStore queue now use `__location__.id`
      if (item?.__location__?.id) {
        finalCompletedIds.add(item.__location__.id);
        finalPendingIds.add(item.__location__.id);
      }
    });

    return {
      ...state,
      completed__Location__Ids: finalCompletedIds,
      pending__Location__Ids: finalPendingIds,
    };
  }, [state, syncQueue]);

  return {
    loading: session.status === "loading" || isLoading,
    err: error instanceof Error ? error.message : "",
    ...mergedState, // 🚀 Return the merged state so the UI sees everything
  };
}