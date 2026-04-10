import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Stack } from "@/components/ui/Stack";
import { Section } from "@/components/ui/Section";
import { CardShell } from "@/components/ui/CardShell";
import { AppText } from "@/components/ui/AppText";
import { AppButton } from "@/components/ui/AppButton";

import { useSession } from "@/lib/providers/SessionProvider";
import { useLocation } from "@/lib/providers/LocationProvider";
import { useBadgesData } from "@/lib/hooks/useBadgesData";
import { useNearestUncompleted } from "@/lib/hooks/useNearestUncompleted";
import { useAppData } from "@/lib/providers/DataProvider";

import { LocationsToReviewCard } from "@/components/progress/LocationsToReviewCard";
import { BadgesSummaryCard } from "@/components/badges/BadgesSummaryCard";
import { NearestUncompletedCard } from "@/components/progress/NearestUncompletedCard";
import { ProgressHeaderCard } from "@/components/progress/ProgressHeader";

import { goBadges, goLocation, goLocationsHome, goLogin, goProgressHome } from "@/lib/routes";

export default function ProgressScreen() {
  const { session } = useSession();

  if (session.status === "loading") {
    return (
      <Screen>
        <LoadingState label="Syncing progress…" />
      </Screen>
    );
  }

  if (session.status !== "authed") return <GuestProgress />;

  return <AuthedProgress />;
}

function GuestProgress() {
  return (
    <Screen scrollable padded>
      <Section title="Progress">
        <CardShell status="surf">
          <Stack gap="md">
            <AppText variant="body">
              Join the community to track your visits, earn badges for exploring __ENTITY_PLURAL__,
              and share your experiences.
            </AppText>
            <Stack gap="sm">
              <AppButton variant="primary" onPress={goLogin}>
                Sign In
              </AppButton>
              <AppButton variant="secondary" onPress={goLocationsHome}>
                Browse __ENTITY_PLURAL__
              </AppButton>
            </Stack>
          </Stack>
        </CardShell>
      </Section>
    </Screen>
  );
}

function AuthedProgress() {
  const { locationsData, completionsData: my, reviewsData: myReviews } = useAppData();
  const { locations, loading: locationsLoading, err: locationsErr } = locationsData;

  const { location: loc, errorMsg: locErr } = useLocation();
  const { badgeState } = useBadgesData();

  const totals = useMemo(() => {
    const total = locations.length;
    const completed = locations.filter((c) => my.completedLocationIds.has(c.id)).length;
    const percent = total === 0 ? 0 : completed / total;
    return { total, completed, percent };
  }, [locations, my.completedLocationIds]);

  const nearestUncompleted = useNearestUncompleted(locations, my.completedLocationIds, loc);

  const locationsToReview = useMemo(() => {
    return locations.filter(
      (c) => my.completedLocationIds.has(c.id) && !myReviews.reviewedLocationIds.has(c.id),
    );
  }, [locations, my.completedLocationIds, myReviews.reviewedLocationIds]);

  const loading = locationsLoading || my.loading || myReviews.loading;
  const fatalErr = locationsErr || my.err || myReviews.err;

  if (loading)
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );

  if (fatalErr) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <ErrorCard
            title="Progress Error"
            message={fatalErr}
            action={{ label: "Retry", onPress: goProgressHome }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable padded>
      <Stack gap="xl">
        <ProgressHeaderCard
          completed={totals.completed}
          total={totals.total}
          percent={totals.percent}
          reviewCount={myReviews.reviewedLocationIds.size}
          shareCount={my.shareBonusCount || 0}
          allDone={totals.completed >= totals.total && totals.total > 0}
          onOpenBadges={goBadges}
          onBrowseLocations={goLocationsHome}
        />

        <Section>
          <NearestUncompletedCard
            location={nearestUncompleted?.location}
            distanceMeters={nearestUncompleted?.distanceMeters}
            locErr={locErr}
            onOpenLocation={goLocation}
          />
        </Section>

        {locationsToReview.length > 0 && (
          <Section>
            <LocationsToReviewCard locations={locationsToReview} onOpenLocation={goLocation} />
          </Section>
        )}

        <Section>
          <BadgesSummaryCard
            nextUp={badgeState.nextUp}
            recentlyUnlocked={badgeState.recentlyUnlocked}
            onViewAll={goBadges}
          />
        </Section>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
  },
});