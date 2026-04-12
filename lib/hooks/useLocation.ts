import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "@react-native-firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import type { __Location__ } from "@/lib/models";

async function fetch__Location__(__location__Id: string): Promise<__Location__ | null> {
  const ref = doc(db, COL.__locations__, __location__Id);
  const docSnap = await getDoc(ref);

  if (!docSnap.exists()) {
    throw new Error("__Location__ not found");
  }

  const data = docSnap.data();
  if (!data) return null;

  return {
    id: docSnap.id,
    ...data,
    name: data.name ?? "",
    description: data.description ?? "",
  } as __Location__;
}

export function use__Location__(__location__Id: string | null | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["__location__", __location__Id],
    queryFn: () => fetch__Location__(__location__Id!),
    enabled: !!__location__Id,

    // 1. Consider data fresh for 2 weeks (in milliseconds)
    staleTime: 1000 * 60 * 60 * 24 * 14, 
    
    // 2. Keep the inactive data in memory for a week
    gcTime: 1000 * 60 * 60 * 24 * 14,

    // 3. STOP refetching just because they switched apps
    refetchOnWindowFocus: false,

    // 4. STOP refetching just because their internet briefly dropped and reconnected
    refetchOnReconnect: false,
  });

  return {
    __location__: data || null,
    loading: isLoading,
    err: error instanceof Error ? error.message : "",
  };
}