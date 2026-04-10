import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completionService } from "@/lib/services/completionService";
import { useSyncStore } from "@/lib/store/useSyncStore";
import * as Sentry from "@sentry/react-native";

export function useLocationCompletionMutation() {
  const queryClient = useQueryClient();
  const addToQueue = useSyncStore((state) => state.addToQueue);
  const processQueue = useSyncStore((state) => state.processQueue);

  const mutation = useMutation({
    mutationFn: async (args: Parameters<typeof completionService.completeLocation>[0]) => {
      // 1. Snapshot the visit into the Persistent Offline Queue immediately
      addToQueue(args);

      // 2. Trigger the background processor (doesn't matter if it fails/is offline)
      // We don't await this because we want the UI to feel instant
      processQueue();

      return { ok: true };
    },
    onSuccess: (_, args) => {
      const uid = args.uid;
      const locationId = args.location.id;

      // 3. OPTIMISTIC INVALIDATION
      // Even though the sync might be pending, we tell React Query to refetch
      // or we manually update the cache so the 'Visited' checkmark appears.
      queryClient.invalidateQueries({ queryKey: ["myCompletions", uid] });
      queryClient.invalidateQueries({ queryKey: ["location", locationId] });
      queryClient.invalidateQueries({ queryKey: ["appData"] });
    },
  });

  const completeLocation = async (
    args: Parameters<typeof completionService.completeLocation>[0],
  ) => {
    try {
      // This is now effectively "Save to Queue & Notify UI"
      await mutation.mutateAsync(args);
      return { ok: true };
    } catch (error: any) {
      Sentry.captureException(error);
      return { ok: false, err: error.message };
    }
  };

  return {
    completeLocation,
    loading: mutation.isPending,
    err: mutation.error?.message ?? null,
    reset: mutation.reset,
  };
}