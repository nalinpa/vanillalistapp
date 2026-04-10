import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import BottomSheet from "@gorhom/bottom-sheet";

import { goLocation } from "@/lib/routes";
import { Screen } from "@/components/ui/Screen";
import { CardShell } from "@/components/ui/CardShell";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { AppText } from "@/components/ui/AppText";

import { useLocation } from "@/lib/providers/LocationProvider";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { useNearestUncompleted } from "@/lib/hooks/useNearestUncompleted";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { useSession } from "@/lib/providers/SessionProvider";
import { useAppData } from "@/lib/providers/DataProvider";

import { LocationsMapView, initialRegionFrom } from "@/components/map/LocationsMapView";
import { MapOverlayCard } from "@/components/map/MapOverlay";
import { space } from "@/lib/ui/tokens";
import { useLocationStore, useMapStore, useTrackingStore } from "@/lib/store/index";

export default function MapScreen() {
  const { session } = useSession();
  const { locationsData, completionsData } = useAppData();
  const { locations, loading, err } = locationsData;
  const completedIds = completionsData.completedLocationIds;

  const { location: loc, errorMsg: providerErr } = useLocation();

  // Removed the unused `refresh: refreshLocation`
  const { isRefreshing, err: manualErr } = useUserLocation();
  const userLocation = useLocationStore((state) => state.location);

  const locErr = providerErr || manualErr;
  const locStatus = locErr ? "denied" : loc ? "granted" : "unknown";

  const { selectedLocationId, setSelectedLocationId } = useMapStore();

  const nearestUncompleted = useNearestUncompleted(locations, completedIds, loc);
  const { targetId, isTracking } = useTrackingStore();
  useKeepAwake();

  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    // Only auto-select if nothing is currently selected
    if (!selectedLocationId) {
      if (isTracking && targetId) {
        setSelectedLocationId(targetId);
      } else if (nearestUncompleted?.location?.id) {
        setSelectedLocationId(nearestUncompleted.location.id);
      }
    }
  }, [
    selectedLocationId,
    isTracking,
    targetId,
    nearestUncompleted?.location?.id,
    setSelectedLocationId,
  ]);

  const mapLocations = useMemo(() => {
    return locations.map((c) => ({
      id: c.id,
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      radiusMeters: c.radiusMeters,
    }));
  }, [locations]);

  const selectedLocation = useMemo(() => {
    return locations.find((c) => c.id === selectedLocationId) ?? null;
  }, [locations, selectedLocationId]);

  const gate = useGPSGate(selectedLocation, loc);

  const lat = loc?.coords.latitude;
  const lng = loc?.coords.longitude;
  const hasMapLocations = mapLocations.length > 0;

  const initialRegion = useMemo(() => {
    if (loading || !hasMapLocations) return null;

    return initialRegionFrom(lat ?? null, lng ?? null, mapLocations);
  }, [loading, hasMapLocations, lat, lng, mapLocations]);

  const handleLocationPress = useCallback(
    (id: string) => {
      Haptics.selectionAsync();
      setSelectedLocationId(id);
      // Snap the sheet up so they can read the MapOverlayCard clearly
      bottomSheetRef.current?.snapToIndex(1);
    },
    [setSelectedLocationId],
  );

  if (session.status === "loading" || loading) {
    return (
      <Screen>
        <LoadingState label="Locating __ENTITY_PLURAL__..." />
      </Screen>
    );
  }

  if (err) {
    return (
      <Screen>
        <ErrorCard title="Map Error" message={err} />
      </Screen>
    );
  }

  const activeLocation = selectedLocation ?? nearestUncompleted?.location ?? null;
  const overlayDistance =
    selectedLocation && gate ? gate.distanceMeters : nearestUncompleted?.distanceMeters;

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: "Explore", headerTransparent: true }} />

      <View style={styles.flex1}>
        <LocationsMapView
          locations={mapLocations}
          completedIds={completedIds}
          initialRegion={initialRegion!}
          selectedLocationId={selectedLocationId}
          onPressLocation={handleLocationPress}
        />

        {locErr && (
          <View style={styles.overlayTop}>
            <CardShell status="warning" style={styles.alertCard}>
              <AppText variant="label" style={styles.boldText}>
                {locErr}
              </AppText>
            </CardShell>
          </View>
        )}

        {activeLocation && (
          <MapOverlayCard
            id={activeLocation.id}
            title={activeLocation.name}
            distanceMeters={overlayDistance ?? 0}
            onOpen={() => goLocation(activeLocation.id)}
            locStatus={locStatus}
            hasLoc={!!loc}
            userLocation={userLocation}
            refreshingGPS={isRefreshing}
            completed={completedIds.has(activeLocation.id)}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  overlayTop: {
    position: "absolute",
    top: 60,
    left: space.md,
    right: space.md,
  },
  overlayBottom: {
    position: "absolute",
    bottom: space.lg,
    left: space.md,
    right: space.md,
  },
  alertCard: {
    paddingVertical: space.sm,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  boldText: { fontWeight: "800" },
});