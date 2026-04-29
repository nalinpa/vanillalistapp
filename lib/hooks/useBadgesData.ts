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
  completed__Entity__Ids: Set<string>;
  shareBonusCount: number;
  shared__Entity__Ids: Set<string>;
  completedAtBy__Entity__Id: Record<string, number>;
  reviewed__Entity__Ids: Set<string>;
  reviewCount: number;
  reviewedAtBy__Entity__Id: Record<string, number>;
  __entities__: __ENTITY__[];
  uncompleted__Entities__: __ENTITY__[];
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

  const completed__Entity__Ids = my.completed__Entity__Ids;
  const shareBonusCount = my.shareBonusCount;
  const shared__Entity__Ids = my.shared__Entity__Ids;
  const completedAtBy__Entity__Id = my.completedAtBy__Entity__Id;

  const reviewed__Entity__Ids = reviews.reviewed__Entity__Ids;
  const reviewCount = reviews.reviewCount;
  const reviewedAtBy__Entity__Id = reviews.reviewedAtBy__Entity__Id;

  const mergedErr = useMemo(() => {
    return __entities__Err || my.err || reviews.err;
  }, [__entities__Err, my.err, reviews.err]);

  const loading = __entities__Loading || my.loading || reviews.loading;

  const __entities__Meta: __ENTITY__Meta[] = useMemo(() => {
    return (__entities__ || [])..map((e) => ({
      id: e.id,
      active: e.active,
      category: e.category,
      region: e.region,
    }));
  }, [__entities__]);

  const uncompleted__Entities__ = useMemo(() => {
    if (!completed__Entity__Ids.size) return __entities__;
    return __entities__.filter((e) => !completed__Entity__Ids.has(e.id));
  }, [__entities__, completed__Entity__Ids]);

  const badgeState = useMemo(() => {
    return getBadgeState(BADGES, {
      __entities__: __entities__Meta,
      completed__Entity__Ids,
      shareBonusCount,
      shared__Entity__Ids,
      completedAtBy__Entity__Id,
      reviewed__Entity__Ids,
      reviewCount,
      reviewedAtBy__Entity__Id,
    });
  }, [
    __entities__Meta,
    completed__Entity__Ids,
    shareBonusCount,
    shared__Entity__Ids,
    completedAtBy__Entity__Id,
    reviewed__Entity__Ids,
    reviewCount,
    reviewedAtBy__Entity__Id,
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
    uncompleted__Entities__,
    completed__Entity__Ids,
    shareBonusCount,
    shared__Entity__Ids,
    completedAtBy__Entity__Id,
    reviewed__Entity__Ids,
    reviewCount,
    reviewedAtBy__Entity__Id,
    badgeState,
    badgeTotals,
    badgeItems,
  };
}