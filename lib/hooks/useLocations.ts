import { useQuery } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

import { db } from "@/lib/firebase";
import { COL } from "@/lib/constants/firestore";
import type { Location } from "@/lib/models";

async function fetchLocations(): Promise<Location[]> {
  const q = query(
    collection(db, COL.locations),
    where("active", "==", true),
    orderBy("name", "asc"),
  );

  // Pass the query into the getDocs() function
  const snap = await getDocs(q);

  return snap.docs.map((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
    const val = d.data();
    return {
      id: d.id,
      ...val,
    } as Location;
  });
}

export function useLocations() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  return {
    locations: data || [],
    loading: isLoading,
    err: error instanceof Error ? error.message : "",
  };
}