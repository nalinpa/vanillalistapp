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

  entitiesMeta: __ENTITY__Meta[];
  completedEntityIds: Set<string>;
  shareBonusCount: number;
  sharedEntityIds: Set<string>;
  completedAtByEntityId: Record<string, number>;

  reviewedEntityIds: Set<string>;
  reviewCount: number;
  reviewedAtByEntityId: Record<string, number>;

  entities: __ENTITY__[];
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
    __ENTITY_PLURAL_LOWER__: entities, 
    loading: entitiesLoading, 
    err: entitiesErr 
  } = __ENTITY_PLURAL_LOWER__Data;

  const completedEntityIds = my.completedEntityIds;
  const shareBonusCount = my.shareBonusCount;
  const sharedEntityIds = my.sharedEntityIds;
  const completedAtByEntityId = my.completedAtByEntityId;

  const reviewedEntityIds = reviews.reviewedEntityIds;
  const reviewCount = reviews.reviewCount;
  const reviewedAtByEntityId = reviews.reviewedAtByEntityId;

  const mergedErr = useMemo(() => {
    return entitiesErr || my.err || reviews.err;
  }, [entitiesErr, my.err, reviews.err]);

  const loading = entitiesLoading || my.loading || reviews.loading;

  const entitiesMeta: __ENTITY__Meta[] = useMemo(() => {
    return entities.map((e) => ({
      id: e.id,
      active: e.active,
      category: e.category,
      region: e.region,
    }));
  }, [entities]);

  const uncompletedEntities = useMemo(() => {
    if (!completedEntityIds.size) return entities;
    return entities.filter((e) => !completedEntityIds.has(e.id));
  }, [entities, completedEntityIds]);

  const badgeState = useMemo(() => {
    return getBadgeState(BADGES, {
      entities: entitiesMeta,
      completedEntityIds,
      shareBonusCount,
      sharedEntityIds,
      completedAtByEntityId,
      reviewedEntityIds,
      reviewCount,
      reviewedAtByEntityId,
    });
  }, [
    entitiesMeta,
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
    entities,
    entitiesMeta,
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