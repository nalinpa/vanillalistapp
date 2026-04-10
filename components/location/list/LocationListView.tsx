import React, { useMemo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";

import { CardShell } from "@/components/ui/CardShell";
import { LocationListItem } from "@/components/location/list/LocationListItem";
import { AppText } from "@/components/ui/AppText";
import { Stack } from "@/components/ui/Stack";

import type { LocationRow } from "@/lib/hooks/useSortedLocationRows";

const ItemSeparator = () => <View style={styles.separator} />;

export function LocationListView({
  rows,
  header,
  onPressLocation,
  completedIds,
  hideCompleted = false,
}: {
  rows: LocationRow[];
  header?: React.ReactElement<any> | null;
  onPressLocation: (id: string) => void;
  completedIds?: Set<string>;
  hideCompleted?: boolean;
}) {
  const visibleRows = useMemo(() => {
    if (!hideCompleted || !completedIds || completedIds.size === 0) return rows;
    return rows.filter((r) => !completedIds.has(r.locationData.id));
  }, [rows, hideCompleted, completedIds]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<LocationRow>) => {
      const { locationData, distanceMeters } = item;
      const isCompleted = completedIds?.has(locationData.id) ?? false;

      return (
        <LocationListItem
          id={locationData.id}
          name={locationData.name}
          description={locationData.description}
          distanceMeters={distanceMeters}
          completed={isCompleted}
          onPress={onPressLocation}
          index={index}
        />
      );
    },
    [onPressLocation, completedIds],
  ); // Dependencies are critical here

  return (
    <FlashList
      data={visibleRows}
      keyExtractor={(item) => item.locationData.id}
      renderItem={renderItem} // Reference to memoized function
      // @ts-ignore - FlashList typing quirk
      estimatedItemSize={142}
      ItemSeparatorComponent={ItemSeparator}
      ListHeaderComponent={header ?? null}
      ListHeaderComponentStyle={styles.headerStyle}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      drawDistance={250}
      ListEmptyComponent={
        <CardShell status="basic" style={styles.emptyCard}>
          <Stack gap="xs" align="center">
            <AppText variant="sectionTitle" status="hint">
              No __ENTITY_PLURAL__ Found
            </AppText>
            <AppText variant="body" status="hint" style={styles.centerText}>
              {hideCompleted && completedIds?.size
                ? "You've completed everything in this list!"
                : "Check your filters or active settings."}
            </AppText>
          </Stack>
        </CardShell>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerStyle: {
    marginBottom: 16,
  },
  separator: {
    height: 12,
  },
  emptyCard: {
    marginHorizontal: 16,
    paddingVertical: 32,
  },
  centerText: {
    textAlign: "center",
  },
});