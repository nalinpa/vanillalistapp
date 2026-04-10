import type { LocationCategory, LocationRegion } from "./models";

export type LocationMeta = {
  id: string;
  active: boolean;
  category: LocationCategory;
  region: LocationRegion;
};

export type BadgeDefinition = {
  id: string;
  name: string;
  unlockText: string;
  section: string;
  icon: string;
};

export type BadgeProgress = {
  badge: BadgeDefinition;
  earned: boolean;
  progressLabel?: string | null;
  distanceToEarn?: number | null;
};

export type BadgeProgressMap = Record<string, BadgeProgress>;

export const BADGES: BadgeDefinition[] = [
  {
    id: "first_steps",
    name: "First Steps",
    unlockText: "Visit your first location.",
    section: "Core",
    icon: "👟",
  },
  {
    id: "explorer",
    name: "Explorer",
    unlockText: "Visit 5 locations.",
    section: "Core",
    icon: "🧭",
  },
  {
    id: "wayfinder",
    name: "Wayfinder",
    unlockText: "Visit 10 locations.",
    section: "Core",
    icon: "🗺️",
  },
  {
    id: "halfway_there",
    name: "Halfway There",
    unlockText: "Visit 20 locations.",
    section: "Core",
    icon: "🧗",
  },
  {
    id: "location_collector",
    name: "Location Collector",
    unlockText: "Visit every active location.",
    section: "Core",
    icon: "👑",
  },

  {
    id: "shared_the_view",
    name: "Shared the View",
    unlockText: "Share a photo to social media.",
    section: "Social",
    icon: "📸",
  },
  {
    id: "show_off",
    name: "Show-Off",
    unlockText: "Share 5 photos to social media.",
    section: "Social",
    icon: "✨",
  },

  {
    id: "first_type_a",
    name: "First Type A",
    unlockText: "Visit your first Type A location.",
    section: "Types",
    icon: "📍",
  },
  {
    id: "type_a_fan",
    name: "Type A Fan",
    unlockText: "Visit 10 Type A locations.",
    section: "Types",
    icon: "🎯",
  },
  {
    id: "first_type_b",
    name: "First Type B",
    unlockText: "Visit your first Type B location.",
    section: "Types",
    icon: "💠",
  },
  {
    id: "five_type_b",
    name: "Type B Fan",
    unlockText: "Visit 5 Type B locations.",
    section: "Types",
    icon: "🧩",
  },
  {
    id: "all_type_a",
    name: "All Type A",
    unlockText: "Visit every Type A location.",
    section: "Types",
    icon: "🏆",
  },
  {
    id: "all_type_b",
    name: "All Type B",
    unlockText: "Visit every Type B location.",
    section: "Types",
    icon: "🏅",
  },
  {
    id: "first_type_c",
    name: "First Type C",
    unlockText: "Visit your first Type C location.",
    section: "Types",
    icon: "💧",
  },
  {
    id: "all_type_c",
    name: "All Type C",
    unlockText: "Visit every Type C location.",
    section: "Types",
    icon: "🌊",
  },

  {
    id: "north_master",
    name: "North Master",
    unlockText: "Visit every location in the North region.",
    section: "Regions",
    icon: "🌉",
  },
  {
    id: "central_master",
    name: "Central Master",
    unlockText: "Visit every location in the Central region.",
    section: "Regions",
    icon: "🏙️",
  },
  {
    id: "east_master",
    name: "East Master",
    unlockText: "Visit every location in the East region.",
    section: "Regions",
    icon: "⛵",
  },
  {
    id: "south_master",
    name: "South Master",
    unlockText: "Visit every location in the South region.",
    section: "Regions",
    icon: "🎡",
  },
  {
    id: "west_master",
    name: "West Master",
    unlockText: "Visit every location in the West region.",
    section: "Regions",
    icon: "🌇",
  },

  {
    id: "first_review",
    name: "First Review",
    unlockText: "Write your first review.",
    section: "Reviews",
    icon: "📝",
  },
  {
    id: "critic",
    name: "Critic",
    unlockText: "Write 5 reviews.",
    section: "Reviews",
    icon: "⭐",
  },
  {
    id: "trusted_reviewer",
    name: "Trusted Reviewer",
    unlockText: "Write 10 reviews.",
    section: "Reviews",
    icon: "🌟",
  },
  {
    id: "review_every_location",
    name: "Reviewed Everything",
    unlockText: "Review every active location you’ve visited.",
    section: "Reviews",
    icon: "💯",
  },

  {
    id: "completionist",
    name: "Completionist",
    unlockText: "Visit, share, and review every active location.",
    section: "Completionist",
    icon: "💎",
  },
];

// Helper functions for logic processing
function indexBadges(badges: BadgeDefinition[]) {
  const byId: Record<string, BadgeDefinition> = Object.create(null);
  for (const b of badges) byId[b.id] = b;
  return byId;
}

function countCompleted(locations: LocationMeta[], completedIds: Set<string>) {
  let n = 0;
  for (const c of locations) if (completedIds.has(c.id)) n++;
  return n;
}

function filterTotal(locations: LocationMeta[], pred: (_c: LocationMeta) => boolean) {
  return locations.filter(pred);
}

function countCompletedWhere(
  locations: LocationMeta[],
  completedIds: Set<string>,
  pred: (_c: LocationMeta) => boolean,
) {
  let n = 0;
  for (const c of locations) if (pred(c) && completedIds.has(c.id)) n++;
  return n;
}

function progressToThreshold(current: number, target: number) {
  if (current >= target) return { earned: true, label: null as string | null, dist: 0 };
  const left = target - current;
  return { earned: false, label: `${current} / ${target} (${left} to go)`, dist: left };
}

function timesForLocations(
  locations: LocationMeta[],
  completedLocationIds: Set<string>,
  completedAtByLocationId?: Record<string, number>,
  pred?: (_c: LocationMeta) => boolean,
): number[] {
  if (!completedAtByLocationId) return [];
  const out: number[] = [];
  for (const c of locations) {
    if (!completedLocationIds.has(c.id)) continue;
    if (pred && !pred(c)) continue;
    const t = completedAtByLocationId[c.id];
    if (typeof t === "number" && Number.isFinite(t) && t > 0) out.push(t);
  }
  out.sort((a, b) => a - b);
  return out;
}

function timesForReviewed(
  locations: LocationMeta[],
  reviewedLocationIds: Set<string>,
  reviewedAtByLocationId?: Record<string, number>,
  pred?: (_c: LocationMeta) => boolean,
): number[] {
  if (!reviewedAtByLocationId) return [];
  const out: number[] = [];
  for (const c of locations) {
    if (!reviewedLocationIds.has(c.id)) continue;
    if (pred && !pred(c)) continue;
    const t = reviewedAtByLocationId[c.id];
    if (typeof t === "number" && Number.isFinite(t) && t > 0) out.push(t);
  }
  out.sort((a, b) => a - b);
  return out;
}

function nthTime(sortedTimesAsc: number[], n: number): number | null {
  if (n <= 0) return null;
  if (sortedTimesAsc.length < n) return null;
  return sortedTimesAsc[n - 1] ?? null;
}

function maxTimeForAllRequired(
  requiredLocations: LocationMeta[],
  hasIds: Set<string>,
  atById?: Record<string, number>,
): number | null {
  if (!atById) return null;
  if (requiredLocations.length === 0) return null;

  let max = 0;

  for (const c of requiredLocations) {
    if (!hasIds.has(c.id)) return null;
    const t = atById[c.id];
    if (typeof t !== "number" || !Number.isFinite(t) || t <= 0) return null;
    if (t > max) max = t;
  }

  return max > 0 ? max : null;
}

export function getBadgeState(
  badges: BadgeDefinition[],
  {
    locations,
    completedLocationIds,
    shareCount,
    sharedLocationIds,
    reviewedLocationIds,
    reviewCount,
    completedAtByLocationId,
    reviewedAtByLocationId,
  }: {
    locations: LocationMeta[];
    completedLocationIds: Set<string>;
    shareCount: number;
    sharedLocationIds: Set<string>;
    reviewedLocationIds: Set<string>;
    reviewCount: number;
    completedAtByLocationId?: Record<string, number>;
    reviewedAtByLocationId?: Record<string, number>;
  },
) {
  const badgeById = indexBadges(badges);
  const activeLocations = locations.filter((c) => c.active);

  const totalAll = activeLocations.length;
  const doneAll = countCompleted(activeLocations, completedLocationIds);

  const totalTypeA = filterTotal(activeLocations, (c) => c.category === "type_a").length;
  const doneTypeA = countCompletedWhere(
    activeLocations,
    completedLocationIds,
    (c) => c.category === "type_a",
  );

  const totalTypeB = filterTotal(activeLocations, (c) => c.category === "type_b").length;
  const doneTypeB = countCompletedWhere(
    activeLocations,
    completedLocationIds,
    (c) => c.category === "type_b",
  );

  const totalTypeC = filterTotal(activeLocations, (c) => c.category === "type_c").length;
  const doneTypeC = countCompletedWhere(
    activeLocations,
    completedLocationIds,
    (c) => c.category === "type_c",
  );

  const regions: LocationRegion[] = ["north", "central", "east", "south", "west"];

  const regionTotals: Record<LocationRegion, number> = {
    north: filterTotal(activeLocations, (c) => c.region === "north").length,
    central: filterTotal(activeLocations, (c) => c.region === "central").length,
    east: filterTotal(activeLocations, (c) => c.region === "east").length,
    south: filterTotal(activeLocations, (c) => c.region === "south").length,
    west: filterTotal(activeLocations, (c) => c.region === "west").length,
  };

  const regionDone: Record<LocationRegion, number> = {
    north: countCompletedWhere(
      activeLocations,
      completedLocationIds,
      (c) => c.region === "north",
    ),
    central: countCompletedWhere(
      activeLocations,
      completedLocationIds,
      (c) => c.region === "central",
    ),
    east: countCompletedWhere(activeLocations, completedLocationIds, (c) => c.region === "east"),
    south: countCompletedWhere(
      activeLocations,
      completedLocationIds,
      (c) => c.region === "south",
    ),
    west: countCompletedWhere(
      activeLocations,
      completedLocationIds,
      (c) => c.region === "west",
    ),
  };

  const progressById: BadgeProgressMap = {};
  const earnedIds = new Set<string>();

  function setProgress(
    id: string,
    earned: boolean,
    progressLabel?: string | null,
    distanceToEarn?: number | null,
  ) {
    const badge = badgeById[id];
    if (!badge) return;

    const bp: BadgeProgress = {
      badge,
      earned,
      progressLabel: progressLabel ?? null,
      distanceToEarn: distanceToEarn ?? null,
    };

    progressById[id] = bp;
    if (earned) earnedIds.add(id);
  }

  // Core Progress
  {
    const p = progressToThreshold(doneAll, 1);
    setProgress("first_steps", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(doneAll, 5);
    setProgress("explorer", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(doneAll, 10);
    setProgress("wayfinder", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(doneAll, 20);
    setProgress("halfway_there", p.earned, p.label, p.dist);
  }
  {
    const earned = totalAll > 0 && doneAll >= totalAll;
    const label = !earned && totalAll > 0 ? `${doneAll} / ${totalAll}` : null;
    const dist = earned ? 0 : totalAll > 0 ? totalAll - doneAll : null;
    setProgress("location_collector", earned, label, dist);
  }

  // Social Progress
  {
    const p = progressToThreshold(shareCount, 1);
    setProgress("shared_the_view", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(shareCount, 5);
    setProgress("show_off", p.earned, p.label, p.dist);
  }

  // Type-based Progress
  setProgress(
    "first_type_a",
    doneTypeA >= 1,
    doneTypeA >= 1 ? null : `${doneTypeA} / 1`,
    doneTypeA >= 1 ? 0 : 1 - doneTypeA,
  );

  {
    const p = progressToThreshold(doneTypeA, 10);
    setProgress("type_a_fan", p.earned, p.label, p.dist);
  }

  setProgress(
    "first_type_b",
    doneTypeB >= 1,
    doneTypeB >= 1 ? null : `${doneTypeB} / 1`,
    doneTypeB >= 1 ? 0 : 1 - doneTypeB,
  );

  {
    const p = progressToThreshold(doneTypeB, 5);
    setProgress("five_type_b", p.earned, p.label, p.dist);
  }
  {
    const earned = totalTypeA > 0 && doneTypeA >= totalTypeA;
    const label =
      !earned && totalTypeA > 0 ? `${doneTypeA} / ${totalTypeA}` : null;
    const dist = earned ? 0 : totalTypeA > 0 ? totalTypeA - doneTypeA : null;
    setProgress("all_type_a", earned, label, dist);
  }
  {
    const earned = totalTypeB > 0 && doneTypeB >= totalTypeB;
    const label = !earned && totalTypeB > 0 ? `${doneTypeB} / ${totalTypeB}` : null;
    const dist = earned ? 0 : totalTypeB > 0 ? totalTypeB - doneTypeB : null;
    setProgress("all_type_b", earned, label, dist);
  }

  setProgress(
    "first_type_c",
    doneTypeC >= 1,
    doneTypeC >= 1 ? null : `${doneTypeC} / 1`,
    doneTypeC >= 1 ? 0 : 1 - doneTypeC,
  );

  {
    const earned = totalTypeC > 0 && doneTypeC >= totalTypeC;
    const label = !earned && totalTypeC > 0 ? `${doneTypeC} / ${totalTypeC}` : null;
    const dist = earned ? 0 : totalTypeC > 0 ? totalTypeC - doneTypeC : null;
    setProgress("all_type_c", earned, label, dist);
  }

  // Regional Mastery
  for (const r of regions) {
    const total = regionTotals[r];
    const done = regionDone[r];

    const earned = total > 0 && done >= total;
    const label = !earned && total > 0 ? `${done} / ${total}` : null;
    const dist = total > 0 ? total - done : null;

    if (r === "north") setProgress("north_master", earned, label, dist);
    if (r === "central") setProgress("central_master", earned, label, dist);
    if (r === "east") setProgress("east_master", earned, label, dist);
    if (r === "south") setProgress("south_master", earned, label, dist);
    if (r === "west") setProgress("west_master", earned, label, dist);
  }

  // Review Progress
  {
    const p = progressToThreshold(reviewCount, 1);
    setProgress("first_review", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(reviewCount, 5);
    setProgress("critic", p.earned, p.label, p.dist);
  }
  {
    const p = progressToThreshold(reviewCount, 10);
    setProgress("trusted_reviewer", p.earned, p.label, p.dist);
  }
  {
    const total = activeLocations.length;
    const done = countCompleted(activeLocations, reviewedLocationIds);
    const earned = total > 0 && done >= total;
    const label = !earned && total > 0 ? `${done} / ${total}` : null;
    const dist = total > 0 ? total - done : null;
    setProgress("review_every_location", earned, label, dist);
  }

  // Completionist
  {
    const total = activeLocations.length;
    let done = 0;
    for (const c of activeLocations) {
      if (
        completedLocationIds.has(c.id) &&
        sharedLocationIds.has(c.id) &&
        reviewedLocationIds.has(c.id)
      ) {
        done++;
      }
    }
    const earned = total > 0 && done >= total;
    const label = !earned && total > 0 ? `${done} / ${total}` : null;
    const dist = total > 0 ? total - done : null;
    setProgress("completionist", earned, label, dist);
  }

  // Calculate Next Achievement
  let nextUp: BadgeProgress | null = null;
  for (const b of badges) {
    const p = progressById[b.id];
    if (!p || p.earned || p.distanceToEarn == null) continue;
    if (!nextUp || p.distanceToEarn < (nextUp.distanceToEarn ?? Infinity)) nextUp = p;
  }

  // Gather timestamp data to find the single most recently unlocked badge
  const allActiveTimes = timesForLocations(
    activeLocations,
    completedLocationIds,
    completedAtByLocationId,
  );

  // Calculate a global fallback time (the time of your most recently completed location)
  const globalLatestTime =
    allActiveTimes.length > 0 ? allActiveTimes[allActiveTimes.length - 1] : 0;

  const typeATimes = timesForLocations(
    activeLocations,
    completedLocationIds,
    completedAtByLocationId,
    (c) => c.category === "type_a",
  );
  const typeBTimes = timesForLocations(
    activeLocations,
    completedLocationIds,
    completedAtByLocationId,
    (c) => c.category === "type_b",
  );
  const typeCTimes = timesForLocations(
    activeLocations,
    completedLocationIds,
    completedAtByLocationId,
    (c) => c.category === "type_c",
  );
  const reviewTimes = timesForReviewed(activeLocations, reviewedLocationIds, reviewedAtByLocationId);

  const unlockAtByBadgeId: Record<string, number | null> = Object.create(null);

  unlockAtByBadgeId["first_steps"] = nthTime(allActiveTimes, 1);
  unlockAtByBadgeId["explorer"] = nthTime(allActiveTimes, 5);
  unlockAtByBadgeId["wayfinder"] = nthTime(allActiveTimes, 10);
  unlockAtByBadgeId["halfway_there"] = nthTime(allActiveTimes, 20);
  unlockAtByBadgeId["location_collector"] = maxTimeForAllRequired(
    activeLocations,
    completedLocationIds,
    completedAtByLocationId,
  );

  unlockAtByBadgeId["first_type_a"] = nthTime(typeATimes, 1);
  unlockAtByBadgeId["type_a_fan"] = nthTime(typeATimes, 10); 
  unlockAtByBadgeId["all_type_a"] = maxTimeForAllRequired(
    activeLocations.filter((c) => c.category === "type_a"),
    completedLocationIds,
    completedAtByLocationId,
  );
  unlockAtByBadgeId["first_type_b"] = nthTime(typeBTimes, 1);
  unlockAtByBadgeId["five_type_b"] = nthTime(typeBTimes, 5);
  unlockAtByBadgeId["all_type_b"] = maxTimeForAllRequired(
    activeLocations.filter((c) => c.category === "type_b"),
    completedLocationIds,
    completedAtByLocationId,
  );
  unlockAtByBadgeId["first_type_c"] = nthTime(typeCTimes, 1);
  unlockAtByBadgeId["all_type_c"] = maxTimeForAllRequired(
    activeLocations.filter((c) => c.category === "type_c"),
    completedLocationIds,
    completedAtByLocationId,
  );

  for (const r of regions) {
    const id =
      r === "north"
        ? "north_master"
        : r === "central"
          ? "central_master"
          : r === "east"
            ? "east_master"
            : r === "south"
              ? "south_master"
              : "west_master";
    unlockAtByBadgeId[id] = maxTimeForAllRequired(
      activeLocations.filter((c) => c.region === r),
      completedLocationIds,
      completedAtByLocationId,
    );
  }

  unlockAtByBadgeId["first_review"] = nthTime(reviewTimes, 1);
  unlockAtByBadgeId["critic"] = nthTime(reviewTimes, 5);
  unlockAtByBadgeId["trusted_reviewer"] = nthTime(reviewTimes, 10);
  unlockAtByBadgeId["review_every_location"] = maxTimeForAllRequired(
    activeLocations,
    reviewedLocationIds,
    reviewedAtByLocationId,
  );

  {
    const earned = earnedIds.has("completionist");
    if (!earned) {
      unlockAtByBadgeId["completionist"] = null;
    } else {
      let max = 0;
      for (const c of activeLocations) {
        const t1 = completedAtByLocationId?.[c.id] ?? 0;
        const t2 = reviewedAtByLocationId?.[c.id] ?? 0;
        const t = Math.max(t1, t2);
        if (t > max) max = t;
      }
      unlockAtByBadgeId["completionist"] = max > 0 ? max : null;
    }
  }

  // Calculate the single most Recently Unlocked badge
  const recentlyUnlocked = badges
    .filter((b) => earnedIds.has(b.id))
    .map((b) => ({
      badgeId: b.id,
      // If a specific timestamp is missing (like social badges), fallback to the latest known completion time
      unlockAtMs: unlockAtByBadgeId[b.id] ?? globalLatestTime,
    }))
    .filter((x) => x.unlockAtMs > 0) // Only keep valid timestamps
    .sort((a, b) => b.unlockAtMs - a.unlockAtMs)
    .slice(0, 1) // Always grab exactly 1 (the most recent)
    .map((x) => progressById[x.badgeId])
    .filter((p): p is BadgeProgress => !!p);

  return { earnedIds, progressById, nextUp, recentlyUnlocked };
}