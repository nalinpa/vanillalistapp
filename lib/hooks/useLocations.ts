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
import type { __Location__ } from "@/lib/models";

async function fetch__Locations__(): Promise<__Location__[]> {
  const q = query(
    collection(db, COL.__locations__),
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
    } as __Location__;
  });
}

export function use__Locations__() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["__locations__"],
    queryFn: fetch__Locations__,
  });

  return {
    __locations__: data || [],
    loading: isLoading,
    err: error instanceof Error ? error.message : "",
  };
}