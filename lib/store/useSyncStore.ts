import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import { completionService } from "../services/completionService";

type CompleteLocationArgs = Parameters<typeof completionService.completeLocation>[0];

interface SyncState {
  queue: CompleteLocationArgs[];
  isSyncing: boolean;
  addToQueue: (visit: CompleteLocationArgs) => void;
  processQueue: () => Promise<void>;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      queue: [],
      isSyncing: false,

      addToQueue: (visit) => {
        const { queue } = get();
        // Prevent duplicate queue entries for the same location
        if (queue.some((v) => v.location.id === visit.location.id)) return;
        set({ queue: [...queue, visit] });
      },

      processQueue: async () => {
        const { queue, isSyncing } = get();

        if (isSyncing || queue.length === 0) return;

        set({ isSyncing: true });

        const remainingQueue: CompleteLocationArgs[] = [];

        for (const visit of queue) {
          try {
            const res = await completionService.completeLocation(visit);

            if (res && res.ok === false) {
              // Ignore deliberate network timeouts, but log actual Firebase rejections
              if (res.err !== "FIREBASE_TIMEOUT") {
                Sentry.captureMessage(
                  `Firebase rejected location sync: ${res.err}`,
                  "warning",
                );
              }
              remainingQueue.push(visit);
            }
          } catch (error) {
            // Log true crashes to Sentry with extra context
            Sentry.captureException(error, {
              tags: { context: "SyncEngine" },
              extra: { locationName: visit.location.name, locationId: visit.location.id },
            });
            remainingQueue.push(visit);
          }
        }

        set({ queue: remainingQueue, isSyncing: false });
      },
    }),
    {
      name: "location-sync-storage-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ queue: state.queue }),
    },
  ),
);