import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";
import { shareService } from "@/lib/services/share/shareService";
import { completionService } from "@/lib/services/completionService";

export function useLocationShareAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      previewUri,
      uid,
      locationId,
    }: {
      previewUri: string;
      uid: string | null;
      locationId: string;
    }) => {
      // 1. Trigger the Native Share Sheet
      const res = await shareService.shareImageUriAsync(previewUri);

      if (!res.ok) throw new Error("Share cancelled or failed");

      // 2. If successful, log the event in Firebase
      if (uid) {
        // Ensure confirmShareBonus is renamed to confirmShare in completionService.ts
        await completionService.confirmShare({
          uid,
          locationId,
          platform: "share-sheet",
        });
      }

      return res;
    },
    onSuccess: () => {
      // 3. Invalidate caches to reflect the shared status
      queryClient.invalidateQueries({ queryKey: ["myCompletions"] });
      queryClient.invalidateQueries({ queryKey: ["appData"] });
    },
    onError: (error) => {
      Sentry.captureException(error);
    },
  });
}