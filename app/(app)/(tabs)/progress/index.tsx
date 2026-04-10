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

import { __Locations__ToReviewCard } from "@/components/progress/__Locations__ToReviewCard";
import { BadgesSummaryCard } from "@/components/badges/BadgesSummaryCard";
import { NearestUncompletedCard } from "@/components/progress/NearestUncompletedCard";
import { ProgressHeaderCard } from "@/components/progress/ProgressHeader";

import { goBadges, go__Location__, go__Locations__Home, goLogin, goProgressHome } from "@/lib/routes";

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
              <AppButton variant="secondary" onPress={go__Locations__Home}>
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
  const { __locations__Data, completionsData: my, reviewsData: myReviews } = useAppData();
  const { __locations__, loading: __locations__Loading, err: __locations__Err } = __locations__Data;

  const { location: loc, errorMsg: locErr } = useLocation();
  const { badgeState } = useBadgesData();

  const totals = useMemo(() => {
    const total = __locations__.length;
    const completed = __locations__.filter((c) => my.completedLocationIds.has(c.id)).length;
    const percent = total === 0 ? 0 : completed / total;
    return { total, completed, percent };
  }, [__locations__, my.completed__Location__Ids]);

  const nearestUncompleted = useNearestUncompleted(__locations__, my.completed____Location____Ids, loc);

  const __locations__ToReview = useMemo(() => {
    return __locations__.filter(
      (c) => my.completed__Location__Ids.has(c.id) && !myReviews.reviewed__Location__Ids.has(c.id),
    );
  }, [__locations__, my.completed__Location__Ids, myReviews.reviewed__Location__Ids]);

  const loading = __locations__Loading || my.loading || myReviews.loading;
  const fatalErr = __locations__Err || my.err || myReviews.err;

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
          onBrowse__Location__s={go__Locations__Home}
        />

        <Section>
          <NearestUncompletedCard
            __location__={nearestUncompleted?.__location__}
            distanceMeters={nearestUncompleted?.distanceMeters}
            locErr={locErr}
            onOpen__Location__={go__Location__}
          />
        </Section>

        {__locations__ToReview.length > 0 && (
          <Section>
            <__Locations__ToReviewCard 
            __locations__={__locations__ToReview} onOpen__Location__={go__Location__} />
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