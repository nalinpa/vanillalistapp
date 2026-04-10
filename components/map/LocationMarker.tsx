import React from "react";
import { View, StyleSheet } from "react-native";
import { Check, MapPin } from "lucide-react-native";

const CANVAS_SIZE = 37;
const CIRCLE_SIZE = 32;
const BG_COLOR = "white";

// Memoize the visual component to avoid re-calculating SVG paths
export const ____Location____Marker = React.memo(function __Location__Marker({
  selected,
  completed,
}: {
  selected: boolean;
  completed: boolean;
}) {
  const markerColor = completed ? "__PRIMARY_COLOR__" : "rgba(30, 41, 59, 1)";

  return (
    <View style={styles.container}>
      <View style={[styles.circle, selected ? styles.selected : styles.unselected]}>
        <MapPin
          size={20}
          color={markerColor}
          fill={selected ? markerColor : "transparent"}
          strokeWidth={2.5}
        />
      </View>

      {completed && (
        <View style={styles.badge}>
          <Check size={10} color="#fff" strokeWidth={4} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    alignItems: "center",
    justifyContent: "center",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: BG_COLOR,
    borderWidth: 2,
  },
  unselected: {
    borderColor: "rgba(30, 41, 59, 0.8)",
  },
  selected: {
    borderColor: "__PRIMARY_COLOR__",
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: BG_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
});