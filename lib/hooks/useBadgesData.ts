import { useMemo } from "react";

import type { __ENTITY__Meta, BadgeProgress } from "@/lib/badges";
import { BADGES, getBadgeState } from "@/lib/badges";
import type { __ENTITY__ } from "@/lib/models";
import { useAppData } from "@/lib/providers/DataProvider";

export type BadgeTileItem = {
  id: string;
  name: string;
  icon: string;
  unlockText: string;
  unlocked: boolean;
  progressLabel: string | null;
};

type BadgesData = {
  loading: boolean;
  err: string;
  __entities__Meta: __ENTITY__Meta[];
  completedEntityIds: Set<string>;
  shareBonusCount: number;
  sharedEntityIds: Set<string>;
  completedAtByEntityId: Record<string, number>;
  reviewedEntityIds: Set<string>;
  reviewCount: number;
  reviewedAtByEntityId: Record<string, number>;
  __entities__: __ENTITY__[];
  uncompletedEntities: __ENTITY__[];
  badgeState: {
    earnedIds: Set<string>;
    progressById: Record<string, BadgeProgress>;
    nextUp: BadgeProgress | null;
    recentlyUnlocked: BadgeProgress[];
  };
  badgeTotals: { unlocked: number; total: number };
  badgeItems: BadgeTileItem[];
};

export function useBadgesData(): BadgesData {
  // Destructure all the cached data from the global provider
  const { 
    __ENTITY_PLURAL_LOWER__Data, 
    completionsData: my, 
    reviewsData: reviews 
  } = useAppData();

  const { 
    __ENTITY_PLURAL_LOWER__: __entities__, 
    loading: __entities__Loading, 
    err: __entities__Err 
  } = __ENTITY_PLURAL_LOWER__Data;

  const completedEntityIds = my.completedEntityIds;
  const shareBonusCount = my.shareBonusCount;
  const sharedEntityIds = my.sharedEntityIds;
  const completedAtByEntityId = my.completedAtByEntityId;

  const reviewedEntityIds = reviews.reviewedEntityIds;
  const reviewCount = reviews.reviewCount;
  const reviewedAtByEntityId = reviews.reviewedAtByEntityId;

  const mergedErr = useMemo(() => {
    return __entities__Err || my.err || reviews.err;
  }, [__entities__Err, my.err, reviews.err]);

  const loading = __entities__Loading || my.loading || reviews.loading;

  const __entities__Meta: __ENTITY__Meta[] = useMemo(() => {
    return __entities__.map((e) => ({
      id: e.id,
      active: e.active,
      category: e.category,
      region: e.region,
    }));
  }, [__entities__]);

  const uncompletedEntities = useMemo(() => {
    if (!completedEntityIds.size) return __entities__;
    return __entities__.filter((e) => !completedEntityIds.has(e.id));
  }, [__entities__, completedEntityIds]);

  const badgeState = useMemo(() => {
    return getBadgeState(BADGES, {
      __entities__: __entities__Meta,
      completedEntityIds,
      shareBonusCount,
      sharedEntityIds,
      completedAtByEntityId,
      reviewedEntityIds,
      reviewCount,
      reviewedAtByEntityId,
    });
  }, [
    __entities__Meta,
    completedEntityIds,
    shareBonusCount,
    sharedEntityIds,
    completedAtByEntityId,
    reviewedEntityIds,
    reviewCount,
    reviewedAtByEntityId,
  ]);

  const badgeTotals = useMemo(() => {
    return { unlocked: badgeState.earnedIds.size, total: BADGES.length };
  }, [badgeState.earnedIds]);

  const badgeItems = useMemo<BadgeTileItem[]>(() => {
    return BADGES.map((b) => {
      const progress = badgeState.progressById[b.id];
      const unlocked = badgeState.earnedIds.has(b.id);

      return {
        id: b.id,
        name: b.name,
        icon: b.icon,
        unlockText: b.unlockText,
        unlocked,
        progressLabel: unlocked ? null : (progress?.progressLabel ?? null),
      };
    });
  }, [badgeState.earnedIds, badgeState.progressById]);

  return {
    loading,
    err: mergedErr,
    __entities__,
    __entities__Meta,
    uncompletedEntities,
    completedEntityIds,
    shareBonusCount,
    sharedEntityIds,
    completedAtByEntityId,
    reviewedEntityIds,
    reviewCount,
    reviewedAtByEntityId,
    badgeState,
    badgeTotals,
    badgeItems,
  };
}