import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, Linking } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { CardShell } from "@/components/ui/CardShell";
import { Stack } from "@/components/ui/Stack";
import { AppText } from "@/components/ui/AppText";

import { goLocation, goAccountHome } from "@/lib/routes";
import { useSortedLocationRows } from "@/lib/hooks/useSortedLocationRows";
import { useSession } from "@/lib/providers/SessionProvider";
import { useLocation } from "@/lib/providers/LocationProvider";
import { useLocationStore, useFiltersStore } from "@/lib/store/index";
import { useAppData } from "@/lib/providers/DataProvider";

import { LocationsListView } from "@/components/location/list/LocationsListView";
import { LocationsListHeader } from "@/components/location/list/LocationListHeader";
import { LocationFiltersCard } from "@/components/location/list/LocationFiltersCard";

export default function LocationListPage() {
  const { session } = useSession();
  const isGuest = session.status === "guest";

  // Use 'liveLoc' to avoid clashing with 'locations' domain data
  const { location: liveLoc, errorMsg: locErr } = useLocation();
  const locStatus = locErr ? "denied" : liveLoc ? "granted" : "unknown";

  const { locationsData, completionsData } = useAppData();
  const { locations, loading: locationsLoading, err: locationsErr } = locationsData;
  const { completedLocationIds, loading: compLoading } = completionsData;

  const [lockedLoc, setLockedLoc] = useState(() => useLocationStore.getState().location);
  const { filters, setFilters } = useFiltersStore();

  useEffect(() => {
    if (!lockedLoc && liveLoc) {
      setLockedLoc(liveLoc);
    }
  }, [liveLoc, lockedLoc]);

  const handleRefreshGPS = () => {
    if (locStatus === "denied") {
      Linking.openSettings();
    } else {
      setLockedLoc(null);
    }
  };

  const filteredRows = useMemo(() => {
    const active = locations.filter((c) => !!c.active);
    let list = active;

    if (!isGuest) {
      if (filters.hideCompleted) list = list.filter((c) => !completedLocationIds.has(c.id));
      if (filters.region !== "all")
        list = list.filter((c) => c.region === filters.region);
      if (filters.category !== "all")
        list = list.filter((c) => c.category === filters.category);
    }
    return list;
  }, [locations, filters, completedLocationIds, isGuest]);

  const rows = useSortedLocationRows(filteredRows, lockedLoc);

  if (locationsLoading || session.status === "loading") {
    return (
      <Screen>
        <LoadingState label="Finding __ENTITY_PLURAL__..." />
      </Screen>
    );
  }

  if (locationsErr) {
    return (
      <Screen>
        <ErrorCard title="Connection Issue" message={locationsErr} />
      </Screen>
    );
  }

  const header = (
    <Stack gap="md" style={styles.headerStack}>
      <View style={styles.paddedSection}>
        <LocationsListHeader
          status={locStatus}
          hasLoc={!!lockedLoc}
          locErr={locErr || ""}
          onPressGPS={handleRefreshGPS}
        />
      </View>

      {isGuest ? (
        <View style={styles.paddedSection}>
          <CardShell status="surf" onPress={goAccountHome}>
            <Stack gap="xs">
              <AppText variant="sectionTitle">Unlock Tracking</AppText>
              <AppText variant="label" status="hint">
                Sign in to filter by completion and track your visits.
              </AppText>
            </Stack>
          </CardShell>
        </View>
      ) : (
        <View style={styles.fullWidth}>
          <LocationFiltersCard
            value={filters}
            onChange={setFilters}
            completedCount={completedLocationIds.size}
            completionsLoading={compLoading}
            shownCount={rows.length}
          />
        </View>
      )}
    </Stack>
  );

  return (
    <Screen padded={false}>
      {rows.length === 0 ? (
        <View style={styles.emptyContainer}>
          {header}
          <View style={styles.paddedSection}>
            <CardShell style={styles.emptyCard}>
              <Stack gap="sm" align="center">
                <AppText variant="h3">No __ENTITY_PLURAL__ Found</AppText>
                <AppText variant="body" status="hint" style={styles.centerText}>
                  Try adjusting your filters or checking a different region.
                </AppText>
              </Stack>
            </CardShell>
          </View>
        </View>
      ) : (
        <LocationsListView
          rows={rows}
          header={header}
          onPressLocation={goLocation}
          completedIds={completedLocationIds}
          hideCompleted={filters.hideCompleted}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerStack: {
    paddingTop: 12,
    paddingBottom: 8,
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  paddedSection: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyCard: {
    marginTop: 20,
    paddingVertical: 40,
  },
  centerText: {
    textAlign: "center",
  },
});