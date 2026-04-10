import React, { useEffect, useState } from "react";
import { Marker } from "react-native-maps";
import { __Location__Marker } from "@/components/map/__Location__Marker";
import type {__ Location__MapPoint__ } from "./__Locations__MapView";

type TrackedMarkerProps = {
  __location__Data: __Location__MapPoint;
  selected: boolean;
  completed: boolean;
  onPress: (id: string) => void;
};

export const TrackedMarker = React.memo(
  ({ __location__Data, selected, completed, onPress }: TrackedMarkerProps) => {
    // 1. Start with tracking ENABLED so it definitely renders the first time
    const [track, setTrack] = useState(true);

    useEffect(() => {
      // 2. Whenever selected or completed status changes,
      // re-enable tracking to capture the new visual state.
      setTrack(true);

      // 3. After a brief delay (long enough for SVG/Layout to finish),
      // disable tracking to save performance.
      const timer = setTimeout(() => {
        setTrack(false);
      }, 600);

      return () => clearTimeout(timer);
    }, [selected, completed]);

    return (
      <Marker
        coordinate={{ latitude: __location__Data.lat, longitude: __location__Data.lng }}
        onPress={() => onPress(__location__Data.id)}
        // The magic fix: only stays true long enough to "snap" the image
        tracksViewChanges={track}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={selected ? 2 : 1}
      >
        <__Location__Marker selected={selected} completed={completed} />
      </Marker>
    );
  },
  (prev, next) => {
    // Standard memo comparison
    return (
      prev.selected === next.selected &&
      prev.completed === next.completed &&
      prev.__location__Data.id === next.__location__Data.id
    );
  },
);