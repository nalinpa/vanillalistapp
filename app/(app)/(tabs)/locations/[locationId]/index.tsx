import React, { useCallback, useEffect, useState } from "react";
import { AppState, ScrollView, StyleSheet } from "react-native";
import { Stack as ExpoStack, router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { Screen } from "@/components/ui/Screen";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { Stack as UIStack } from "@/components/ui/Stack";

import { useSession } from "@/lib/providers/SessionProvider";
import { useLocation } from "@/lib/providers/LocationProvider";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { use__Location__ } from "@/lib/hooks/use__Location__";
import { useGPSGate } from "@/lib/hooks/useGPSGate";
import { use__Location__ReviewsSummary } from "@/lib/hooks/use__Location__ReviewsSummary";
import { useMyCompletions } from "@/lib/hooks/useMyCompletions";
import { useDraftsStore, useTrackingStore } from "@/lib/store/index";
import { GAMEPLAY } from "@/lib/constants/gameplay";

import { __Location__Hero } from "@/components/__location__/detail/__Location__Hero";
import { ReviewsSummaryCard } from "@/components/__location__/detail/ReviewsSummaryCard";
import { StatusCard } from "@/components/__location__/detail/StatusCard";
import { ActionsCard } from "@/components/__location__/detail/ActionsCard";
import { ReviewModal } from "@/components/__location__/detail/ReviewModal";
import { go__Location__sHome, go__Location__Reviews } from "@/lib/routes";
import { FloatingBackButton } from "@/components/__location__/detail/FloatingBackButton";

const MAX_ACCURACY_METERS = GAMEPLAY.MAX_GPS_ACCURACY_METERS;

export default function __Location__DetailRoute() {
  const { __location__Id } = useLocalSearchParams<{ __location__Id: string }>();
  const { session } = useSession();

  const {
    completed__Location__Ids,
    pending__Location__Ids,
    shared__Location__Ids,
    loading: compsLoading,
  } = useMyCompletions();

  const isCompleted = !!__location__Id && completed__Location__Ids.has(__location__Id);
  const isSyncing = !!__location__Id && pending__Location__Ids.has(__location__Id);
  const hasShareBonus = !!__location__Id && shared__Location__Ids.has(__location__Id);

  const [reviewErr, setReviewErr] = useState<string | null>(null);

  const { __location__, loading: __location__Loading, err: __location__Err } = use__Location__(__location__Id);
  const { location: userCoords, errorMsg: providerErr } = useLocation();
  const { refresh: refreshLocation, err: manualErr } = useUserLocation();

  const locErr = providerErr || manualErr;
  const locStatus = locErr ? "denied" : userCoords ? "granted" : "unknown";

  const gate = useGPSGate(__location__, userCoords, { maxAccuracyMeters: MAX_ACCURACY_METERS });

  const {
    avgRating,
    ratingCount,
    myRating,
    myText: myReviewText,
    saving: reviewsSaving,
    saveReview: saveReviewToDb,
  } = use__Location__ReviewsSummary(__location__Id);

  const [showBackButton, setShowBackButton] = useState(true);
  const [err, setErr] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);

  const { drafts, setDraft, clearDraft } = useDraftsStore();
  const { triggerSuccessUI } = useTrackingStore();
  const currentDraft = drafts[__location__Id || ""] || { rating: null, text: "" };

  const refreshGPS = useCallback(async () => {
    if (locStatus !== "denied") await refreshLocation();
  }, [locStatus, refreshLocation]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (
        state === "active" &&
        (!userCoords || (gate.accuracyMeters || 0) > MAX_ACCURACY_METERS)
      ) {
        refreshGPS();
      }
    });
    return () => sub.remove();
  }, [userCoords, gate.accuracyMeters, refreshGPS]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (err) {
      timeoutId = setTimeout(() => {
        setErr("");
      }, 10000); // 10 seconds and then hide the error
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [err]);

  if (__location__Loading || compsLoading || session.status === "loading") {
    return (
      <Screen>
        <LoadingState label="Scouting __location__..." />
      </Screen>
    );
  }

  if (__location__Err || !__location__) {
    return (
      <Screen>
        <ErrorCard
          title="Peak Not Found"
          message={__location__Err || "Could not find volcano."}
          action={{ label: "Go Back", onPress: go__Location__sHome }}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ExpoStack.Screen
        options={{
          title: __location__.name,
          headerTransparent: true,
          headerTintColor: "#fff",
          headerLeft: () => null,
        }}
      />

      <FloatingBackButton visible={showBackButton} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          setShowBackButton(offsetY < 50);
        }}
      >
        <__Location__Hero __location__={__location__} completed={isCompleted} />

        <UIStack gap="md" style={styles.content}>
          {err && (
            <ErrorCard
              status="warning"
              title="Check-in Issue"
              message={err || "An unknown error occurred"}
            />
          )}

          <StatusCard
            __location__Id={__location__Id}
            title={__location__.name}
            completed={isCompleted}
            loc={userCoords}
            onCheckIn={() => triggerSuccessUI(__location__.name, __location__Id)}
          />

          <ReviewsSummaryCard
            ratingCount={ratingCount}
            avgRating={avgRating}
            onViewAll={() => go__Location__Reviews(__location__.id, __location__.name)}
            isCompleted={isCompleted}
            hasUserReviewed={!!myRating}
            onAddReview={() => setReviewOpen(true)}
          />

          <ActionsCard
            id={__location__.id}
            title={__location__.name}
            distanceMeters={gate.distanceMeters ?? 0}
            completed={isCompleted}
            shareBonus={hasShareBonus}
            isSyncing={isSyncing}
            hasLoc={!!userCoords}
            hasReview={!!myRating}
            myReviewRating={myRating}
            myReviewText={myReviewText}
            onOpenReview={() => setReviewOpen(true)}
            onShareBonus={() =>
              router.push({
                pathname: "/share-frame",
                params: { __location__Id: __location__.id, __location__Name: __location__.name },
              })
            }
          />
        </UIStack>
      </ScrollView>

      <ReviewModal
        visible={reviewOpen}
        saving={reviewsSaving}
        draftRating={currentDraft.rating}
        draftText={currentDraft.text}
        error={reviewErr}
        onChangeRating={(val) => {
          if (__location__Id) setDraft(__location__Id, val, currentDraft.text);
          setReviewErr(null);
        }}
        onChangeText={(text) => {
          if (__location__Id) setDraft(__location__Id, currentDraft.rating, text);
          setReviewErr(null);
        }}
        onClose={() => {
          setReviewOpen(false);
          setReviewErr(null);
        }}
        onSave={async () => {
          setReviewErr(null);
          const res = await saveReviewToDb({
            __location__Id: __location__.id,
            __location__Slug: __location__.slug,
            __location__Name: __location__.name,
            reviewRating: currentDraft.rating!,
            reviewText: currentDraft.text,
          });
          if (res.ok) {
            if (__location__Id) clearDraft(__location__Id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setReviewOpen(false);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setReviewErr(res.err);
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: -20,
  },
});