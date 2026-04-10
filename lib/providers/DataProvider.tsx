import React, { createContext, useContext, useMemo } from "react";
import { useLocations } from "@/lib/hooks/useLocations";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useMyReviews } from "@/lib/hooks/useMyReviews";

// Automatically infer the shapes of your hook returns
type LocationsData = ReturnType<typeof useLocations>;
type CompletionsData = ReturnType<typeof useMyCompletions>;
type ReviewsData = ReturnType<typeof useMyReviews>;

interface AppDataContextType {
  locationsData: LocationsData;
  completionsData: CompletionsData;
  reviewsData: ReviewsData;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  // These hooks mount their onSnapshot listeners EXACTLY ONCE here
  const locationsData = useLocations();
  const completionsData = useMyCompletions();
  const reviewsData = useMyReviews();

  // Memoize the value to prevent unnecessary re-renders across the app
  const value = useMemo(
    () => ({
      locationsData,
      completionsData,
      reviewsData,
    }),
    [locationsData, completionsData, reviewsData],
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