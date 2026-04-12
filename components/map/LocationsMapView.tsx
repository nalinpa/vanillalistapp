import React, { useRef, useCallback, useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import MapView, { Region } from "react-native-maps";

import { TrackedMarker } from "@/components/map/TrackedMarker";
export { initialRegionFrom } from "./MapRegion";

// TODO: Update these boundaries to match your new application's geographic constraints
const DEFAULT_MAP_BOUNDS = {
  northEast: { latitude: -36.56, longitude: 175.15 },
  southWest: { latitude: -37.15, longitude: 174.4 },
};

export type __Location__MapPoint = {
  id: string;
  name?: string;
  lat: number;
  lng: number;
  radiusMeters?: number | null;
};

export const __Locations__MapView = React.memo(function __Locations__MapView({
  __locations__,
  completedIds,
  initialRegion,
  selected__Location__Id,
  onPress__Location__,
}: {
  __locations__: any[];
  completedIds: Set<string>;
  initialRegion: Region;
  selected__Location__Id: string | null;
  onPress__Location__: (id: string) => void;
}) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (selected__Location__Id && mapRef.current) {
      const __location__Data = __locations__.find((loc) => loc.id === selected__Location__Id);
      if (__location__Data) {
        mapRef.current.animateToRegion(
          {
            latitude: __location__Data.lat - 0.005,
            longitude: __location__Data.lng,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          },
          500,
        );
      }
    }
  }, [selected__Location__Id, __locations__]);

  const handleMapReady = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setMapBoundaries(
        DEFAULT_MAP_BOUNDS.northEast,
        DEFAULT_MAP_BOUNDS.southWest,
      );
    }
  }, []);

  const renderedMarkers = useMemo(() => {
    return __locations__.map((loc) => (
      <TrackedMarker
        key={loc.id}
        __location__Data={loc}
        selected={selected__Location__Id === loc.id}
        completed={completedIds.has(loc.id)}
        onPress={onPress__Location__}
      />
    ));
  }, [__locations__, completedIds, selected__Location__Id, onPress__Location__]);

  return (
    <MapView
      ref={mapRef}
      style={styles.flex1}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}
      onMapReady={handleMapReady}
      minZoomLevel={10}
      maxZoomLevel={18}
      moveOnMarkerPress={false}
      showsTraffic={false}
      showsBuildings={false}
    >
      {renderedMarkers}
    </MapView>
  );
});

const styles = StyleSheet.create({
  flex1: { flex: 1 },
});