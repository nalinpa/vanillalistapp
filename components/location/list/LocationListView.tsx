import React, { useMemo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";

import { CardShell } from "@/components/ui/CardShell";
import { __Location__ListItem } from "@/components/__location__/list/__Location__ListItem";
import { AppText } from "@/components/ui/AppText";
import { Stack } from "@/components/ui/Stack";

import type { __Location__Row } from "@/lib/hooks/useSorted__Location__Rows";

const ItemSeparator = () => <View style={styles.separator} />;

export function __Location__ListView({
  rows,
  header,
  onPress__Location__,
  completedIds,
  hideCompleted = false,
}: {
  rows: __Location__Row[];
  header?: React.ReactElement<any> | null;
  onPress__Location__: (id: string) => void;
  completedIds?: Set<string>;
  hideCompleted?: boolean;
}) {
  const visibleRows = useMemo(() => {
    if (!hideCompleted || !completedIds || completedIds.size === 0) return rows;
    return rows.filter((r) => !completedIds.has(r.__location__Data.id));
  }, [rows, hideCompleted, completedIds]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<__Location__Row>) => {
      const { __location__Data, distanceMeters } = item;
      const isCompleted = completedIds?.has(__location__Data.id) ?? false;

      return (
        <__Location__ListItem
          id={__location__Data.id}
          name={__location__Data.name}
          description={__location__Data.description}
          distanceMeters={distanceMeters}
          completed={isCompleted}
          onPress={onPress__Location__}
          index={index}
        />
      );
    },
    [onPress__Location__, completedIds],
  ); // Dependencies are critical here

  return (
    <FlashList
      data={visibleRows}
      keyExtractor={(item) => item.__location__Data.id}
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