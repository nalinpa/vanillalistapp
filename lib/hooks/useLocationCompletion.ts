import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "@react-native-firebase/firestore";
import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";

/**
 * Fetcher for a single completion document.
 */
async function fetchSpecificCompletion(uid: string, locationId: string) {
  const completionId = `${uid}_${locationId}`;

  // Ensure COL.locationCompletions exists in your constants
  const docRef = doc(db, COL.locationCompletions, completionId);
  const snap = await getDoc(docRef);

  if (!snap.exists) {
    return null;
  }

  const data = snap.data();

  return {
    id: snap.id,
    ...data,
  };
}

export function useLocationCompletion(locationId?: string | null) {
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["location-completion-status", uid, locationId],
    queryFn: () => fetchSpecificCompletion(uid!, locationId!),
    enabled: !!uid && !!locationId,
    // Prevents UI flickering by starting with null
    placeholderData: null,
  });

  return {
    isCompleted: !!data,
    completionData: data || null,
    loading: isLoading,
    err: error instanceof Error ? error.message : null,
  };
}