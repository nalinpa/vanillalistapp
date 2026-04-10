import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "@react-native-firebase/firestore";
import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import { useSession } from "@/lib/providers/SessionProvider";

/**
 * Fetcher for a single completion document.
 */
async function fetchSpecificCompletion(uid: string, __location__Id: string) {
  const completionId = `${uid}_${__location__Id}`;

  // Ensure COL.__location__Completions exists in your constants
  const docRef = doc(db, COL.__location__Completions, completionId);
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

export function use__Location__Completion(__location__Id?: string | null) {
  const { session } = useSession();
  const uid = session.status === "authed" ? session.uid : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["__location__-completion-status", uid, __location__Id],
    queryFn: () => fetchSpecificCompletion(uid!, __location__Id!),
    enabled: !!uid && !!__location__Id,
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