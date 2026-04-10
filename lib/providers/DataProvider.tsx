import React, { createContext, useContext, useMemo } from "react";
import { use__Locations__ } from "@/lib/hooks/use__Locations__";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useMyReviews } from "@/lib/hooks/useMyReviews";

// Automatically infer the shapes of your hook returns
type __Locations__Data = ReturnType<typeof use__Locations__>;
type CompletionsData = ReturnType<typeof useMyCompletions>;
type ReviewsData = ReturnType<typeof useMyReviews>;

interface AppDataContextType {
  ____location__s__Data: __Locations__Data;
  completionsData: CompletionsData;
  reviewsData: ReviewsData;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // These hooks mount their onSnapshot listeners EXACTLY ONCE here
  const ____location__s__Data = use__Locations__();
  const completionsData = useMyCompletions();
  const reviewsData = useMyReviews();

  // Memoize the value to prevent unnecessary re-renders across the app
  const value = useMemo(
    () => ({
      ____location__s__Data,
      completionsData,
      reviewsData,
    }),
    [____location__s__Data, completionsData, reviewsData],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within a DataProvider");
  }
  return context;
}