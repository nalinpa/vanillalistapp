import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "@react-native-firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import type { Location } from "@/lib/models";

async function fetchLocation(locationId: string): Promise<Location | null> {
  const ref = doc(db, COL.locations, locationId);
  const docSnap = await getDoc(ref);

  if (!docSnap.exists()) {
    throw new Error("Location not found");
  }

  const data = docSnap.data();
  if (!data) return null;

  return {
    id: docSnap.id,
    ...data,
    name: data.name ?? "",
    description: data.description ?? "",
  } as Location;
}

export function useLocationItem(locationId: string | null | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["location", locationId],
    queryFn: () => fetchLocation(locationId!),
    enabled: !!locationId,

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
    location: data || null,
    loading: isLoading,
    err: error instanceof Error ? error.message : "",
  };
}