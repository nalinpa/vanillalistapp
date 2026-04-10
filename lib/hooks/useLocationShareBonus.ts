import { useCallback, useState } from "react";
import { router } from "expo-router";
import type { ShareLocationPayload } from "@/lib/services/share/types";

export function useLocationShare(locationId: string) {
  const [loading] = useState(false); // sharing happens on the preview page
  const [err, setErr] = useState<string | null>(null);

  const shareAsync = useCallback(
    async (payload: Omit<ShareLocationPayload, "locationId">) => {
      setErr(null);

      router.push({
        pathname: "/share-frame",
        params: {
          locationId,
          locationName: payload.locationName,
          completedAtMs: payload.completedAtMs ? String(payload.completedAtMs) : "",
        },
      });

      // "fire and forget" — UI continues on the ShareFrame route
      return { ok: true as const, mode: "image" as const, shared: false as const };
    },
    [locationId],
  );

  return { shareAsync, loading, err };
}