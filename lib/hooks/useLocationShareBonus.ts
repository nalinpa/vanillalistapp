import { useCallback, useState } from "react";
import { router } from "expo-router";
import type { Share__Location__Payload } from "@/lib/services/share/types";

export function use__Location__Share(__location__Id: string) {
  const [loading] = useState(false); // sharing happens on the preview page
  const [err, setErr] = useState<string | null>(null);

  const shareAsync = useCallback(
    async (payload: Omit<Share__Location__Payload, "__location__Id">) => {
      setErr(null);

      router.push({
        pathname: "/share-frame",
        params: {
          __location__Id,
          __location__Name: payload.__location__Name,
          completedAtMs: payload.completedAtMs ? String(payload.completedAtMs) : "",
        },
      });

      // "fire and forget" — UI continues on the ShareFrame route
      return { ok: true as const, mode: "image" as const, shared: false as const };
    },
    [__location__Id],
  );

  return { shareAsync, loading, err };
}