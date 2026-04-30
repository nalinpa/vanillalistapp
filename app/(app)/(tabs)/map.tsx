import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import BottomSheet from "@gorhom/bottom-sheet";

import { go__Location__ } from "@/lib/routes";
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

import { __Locations__MapView, initialRegionFrom } from "@/components/map/__Locations__MapView";
import { MapOverlayCard } from "@/components/map/MapOverlay";
import { space } from "@/lib/ui/tokens";
import { useLocationStore, useMapStore, useTrackingStore } from "@/lib/store/index";

export default function MapScreen() {
  const { session } = useSession();
  const { __locations__Data, completionsData } = useAppData();
  const { __locations__, loading, err } = __locations__Data;
  const completedIds = completionsData.completed__Location__Ids;

  const { location: loc, errorMsg: providerErr } = useLocation();

  // Removed the unused `refresh: refreshLocation`
  const { isRefreshing, err: manualErr } = useUserLocation();
  const userLocation = useLocationStore((state) => state.location);

  const locErr = providerErr || manualErr;
  const locStatus = locErr ? "denied" : loc ? "granted" : "unknown";

  const { selected__Location__Id, setSelected__Location__Id } = useMapStore();

  const nearestUncompleted = useNearestUncompleted(__locations__, completedIds, loc);
  const { targetId, isTracking } = useTrackingStore();
  useKeepAwake();

  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    // Only auto-select if nothing is currently selected
    if (!selected__Location__Id) {
      if (isTracking && targetId) {
        setSelected__Location__Id(targetId);
      } else if (nearestUncompleted?.__location__?.id) {
        setSelected__Location__Id(nearestUncompleted.__location__.id);
      }
    }
  }, [
    selected__Location__Id,
    isTracking,
    targetId,
    nearestUncompleted?.__location__?.id,
    setSelected__Location__Id,
  ]);

  const map__Locations__ = useMemo(() => {
    return __locations__.map((c) => ({
      id: c.id,
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      radiusMeters: c.radiusMeters,
    }));
  }, [__locations__]);

  const selected__Location__ = useMemo(() => {
    return __locations__.find((c) => c.id === selected__Location__Id) ?? null;
  }, [__locations__, selected__Location__Id]);

  const gate = useGPSGate(selected__Location__, loc);

  const lat = loc?.coords.latitude;
  const lng = loc?.coords.longitude;
  const hasMap__Locations__ = map__Locations__.length > 0;

  const initialRegion = useMemo(() => {
    if (loading || !hasMap__Locations__) return null;

    return initialRegionFrom(lat ?? null, lng ?? null, map__Locations__);
  }, [loading, hasMap__Locations__, lat, lng, map__Locations__]);

  const handle__Location__Press = useCallback(
    (id: string) => {
      Haptics.selectionAsync();
      setSelected__Location__Id(id);
      // Snap the sheet up so they can read the MapOverlayCard clearly
      bottomSheetRef.current?.snapToIndex(1);
    },
    [setSelected__Location__Id],
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

  const active__Location__ = selected__Location__ ?? nearestUncompleted?.__location__ ?? null;
  const overlayDistance =
    selected__Location__ && gate ? gate.distanceMeters : nearestUncompleted?.distanceMeters;

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: "Explore", headerTransparent: true }} />

      <View style={styles.flex1}>
        <__Locations__MapView
          __locations__={map__Locations__}
          completedIds={completedIds}
          initialRegion={initialRegion!}
          selected__Location__Id={selected__Location__Id}
          onPress__Location__={handle__Location__Press}
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

        {active__Location__ && (
          <MapOverlayCard
            id={active__Location__.id}
            title={active__Location__.name}
            distanceMeters={overlayDistance ?? 0}
            onOpen={() => go__Location__(active__Location__.id)}
            locStatus={locStatus}
            hasLoc={!!loc}
            user__Location__={user__Location__}
            refreshingGPS={isRefreshing}
            completed={completedIds.has(active__Location__.id)}
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