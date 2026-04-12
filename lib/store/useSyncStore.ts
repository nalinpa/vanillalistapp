import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import { completionService } from "../services/completionService";

type Complete__Location__Args = Parameters<typeof completionService.complete__Location__>[0];

interface SyncState {
  queue: Complete__Location__Args[];
  isSyncing: boolean;
  addToQueue: (visit: Complete__Location__Args) => void;
  processQueue: () => Promise<void>;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,

      addToQueue: (visit) => {
        const { queue } = get();
        // Prevent duplicate queue entries for the same __location__
        if (queue.some((v) => v.__location__.id === visit.__location__.id)) return;
        set({ queue: [...queue, visit] });
      },

      processQueue: async () => {
        const { queue, isSyncing } = get();

        if (isSyncing || queue.length === 0) return;

        set({ isSyncing: true });

        const remainingQueue: Complete__Location__Args[] = [];

        for (const visit of queue) {
          try {
            const res = await completionService.complete__Location__(visit);

            if (res && res.ok === false) {
              // Ignore deliberate network timeouts, but log actual Firebase rejections
              if (res.err !== "FIREBASE_TIMEOUT") {
                Sentry.captureMessage(
                  `Firebase rejected __location__ sync: ${res.err}`,
                  "warning",
                );
              }
              remainingQueue.push(visit);
            }
          } catch (error) {
            // Log true crashes to Sentry with extra context
            Sentry.captureException(error, {
              tags: { context: "SyncEngine" },
              extra: { __location__Name: visit.__location__.name, __location__Id: visit.__location__.id },
            });
            remainingQueue.push(visit);
          }
        }

        set({ queue: remainingQueue, isSyncing: false });
      },
    }),
    {
      name: "__location__-sync-storage-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ queue: state.queue }),
    },
  ),
);