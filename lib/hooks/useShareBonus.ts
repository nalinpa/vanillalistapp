import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";
import { shareService } from "@/lib/services/share/shareService";
import { completionService } from "@/lib/services/completionService";

export function use__Location__ShareAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      previewUri,
      uid,
      __location__Id,
    }: {
      previewUri: string;
      uid: string | null;
      __location__Id: string;
    }) => {
      // 1. Trigger the Native Share Sheet
      const res = await shareService.shareImageUriAsync(previewUri);

      if (!res.ok) throw new Error("Share cancelled or failed");

      // 2. If successful, log the event in Firebase
      if (uid) {
        // Ensure confirmShareBonus is renamed to confirmShare in completionService.ts
        await completionService.confirmShare({
          uid,
          __location__Id,
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