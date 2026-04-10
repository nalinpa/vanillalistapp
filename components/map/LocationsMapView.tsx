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

export type LocationMapPoint = {
  id: string;
  name?: string;
  lat: number;
  lng: number;
  radiusMeters?: number | null;
};

export const LocationsMapView = React.memo(function LocationsMapView({
  locations,
  completedIds,
  initialRegion,
  selectedLocationId,
  onPressLocation,
}: {
  locations: any[];
  completedIds: Set<string>;
  initialRegion: Region;
  selectedLocationId: string | null;
  onPressLocation: (id: string) => void;
}) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (selectedLocationId && mapRef.current) {
      const locationData = locations.find((loc) => loc.id === selectedLocationId);
      if (locationData) {
        mapRef.current.animateToRegion(
          {
            latitude: locationData.lat - 0.005,
            longitude: locationData.lng,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          },
          500,
        );
      }
    }
  }, [selectedLocationId, locations]);

  const handleMapReady = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setMapBoundaries(
        DEFAULT_MAP_BOUNDS.northEast,
        DEFAULT_MAP_BOUNDS.southWest,
      );
    }
  }, []);

  const renderedMarkers = useMemo(() => {
    return locations.map((loc) => (
      <TrackedMarker
        key={loc.id}
        locationData={loc}
        selected={selectedLocationId === loc.id}
        completed={completedIds.has(loc.id)}
        onPress={onPressLocation}
      />
    ));
  }, [locations, completedIds, selectedLocationId, onPressLocation]);

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