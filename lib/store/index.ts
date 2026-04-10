import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

// --- 1. Guest Store ---
interface GuestState {
  isGuest: boolean;
  setGuest: (val: boolean) => void;
}
export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      isGuest: false,
      setGuest: (val) => set({ isGuest: val }),
    }),
    { name: "guest-storage", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

// --- 2. Location Store (Memory only - GPS tracking) ---
interface LocationState {
  location: Location.LocationObject | null;
  setLocation: (loc: Location.LocationObject | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,

  // Directly updates the global location.
  setLocation: (newLoc) => set({ location: newLoc }),
}));

// --- 3. Filters Store ---
export type LocationFiltersValue = {
  category: string | null;
  region: string | null;
  hideCompleted: boolean;
};
interface FiltersState {
  filters: LocationFiltersValue;
  setFilters: (filters: LocationFiltersValue) => void;
}
export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      filters: { hideCompleted: false, region: "all", category: "all" },
      setFilters: (filters) => set({ filters }),
    }),
    { name: "location-filters", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

// --- 4. App Settings Store ---
interface AppSettingsState {
  hasSeenOnboarding: boolean;
  completeOnboarding: () => void;
}
export const useAppSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: true,
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
    }),
    { name: "app-settings", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

// --- 5. Map State Store (Memory Only) ---
interface MapState {
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string | null) => void;
}
export const useMapStore = create<MapState>((set) => ({
  selectedLocationId: null,
  setSelectedLocationId: (id) => set({ selectedLocationId: id }),
}));

// --- 6. Review Drafts Store ---
interface DraftsState {
  drafts: Record<string, { rating: number | null; text: string }>;
  setDraft: (locationId: string, rating: number | null, text: string) => void;
  clearDraft: (locationId: string) => void;
}
export const useDraftsStore = create<DraftsState>()(
  persist(
    (set) => ({
      drafts: {},
      setDraft: (locationId, rating, text) =>
        set((state) => ({ drafts: { ...state.drafts, [locationId]: { rating, text } } })),
      clearDraft: (locationId) =>
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[locationId];
          return { drafts: newDrafts };
        }),
    }),
    { name: "review-drafts", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

// --- 7. Tracking Store ---
interface TrackingState {
  targetId: string | null;
  targetName: string | null;
  isTracking: boolean;

  showSuccess: boolean;
  successTarget: string | null;
  successId: string | null;

  startTracking: (id: string, name: string) => void;
  stopTracking: () => void;

  triggerSuccessUI: (name: string, id: string) => void;
  closeSuccess: () => void;
}

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set, get) => ({
      targetId: null,
      targetName: null,
      isTracking: false,

      showSuccess: false,
      successTarget: null,
      successId: null,

      startTracking: (id, name) => {
        const current = get();
        if (current.isTracking && current.targetId === id) return;
        set({ targetId: id, targetName: name, isTracking: true });
      },

      stopTracking: () => set({ targetId: null, targetName: null, isTracking: false }),

      triggerSuccessUI: (name: string, id: string) => {
        set({
          showSuccess: true,
          successTarget: name,
          successId: id,
          isTracking: false,
          targetId: null,
        });
      },

      closeSuccess: () =>
        set({ showSuccess: false, successTarget: null, successId: null }),
    }),
    {
      name: "tracking-mission",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        targetId: state.targetId,
        targetName: state.targetName,
        isTracking: state.isTracking,
      }),
    },
  ),
);