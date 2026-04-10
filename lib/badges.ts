import type { __Location__Category, __Location__Region } from "./models";

export type __Location__Meta = {
  id: string;
  active: boolean;
  category: __Location__Category;
  region: __Location__Region;
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
    unlockText: "Visit your first __location__.",
    section: "Core",
    icon: "👟",
  },
  {
    id: "explorer",
    name: "Explorer",
    unlockText: "Visit 5 __locations__.",
    section: "Core",
    icon: "🧭",
  },
  {
    id: "wayfinder",
    name: "Wayfinder",
    unlockText: "Visit 10 __locations__.",
    section: "Core",
    icon: "🗺️",
  },
  {
    id: "halfway_there",
    name: "Halfway There",
    unlockText: "Visit 20 __locations__.",
    section: "Core",
    icon: "🧗",
  },
  {
    id: "__location___collector",
    name: "__Location__ Collector",
    unlockText: "Visit every active __location__.",
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
    unlockText: "Visit your first Type A __location__.",
    section: "Types",
    icon: "📍",
  },
  {
    id: "type_a_fan",
    name: "Type A Fan",
    unlockText: "Visit 10 Type A __locations__.",
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
    unlockText: "Visit 5 Type B ____location__s__.",
    section: "Types",
    icon: "🧩",
  },
  {
    id: "all_type_a",
    name: "All Type A",
    unlockText: "Visit every Type A __location__.",
    section: "Types",
    icon: "🏆",
  },
  {
    id: "all_type_b",
    name: "All Type B",
    unlockText: "Visit every Type B __location__.",
    section: "Types",
    icon: "🏅",
  },
  {
    id: "first_type_c",
    name: "First Type C",
    unlockText: "Visit your first Type C __location__.",
    section: "Types",
    icon: "💧",
  },
  {
    id: "all_type_c",
    name: "All Type C",
    unlockText: "Visit every Type C __location__.",
    section: "Types",
    icon: "🌊",
  },

  {
    id: "north_master",
    name: "North Master",
    unlockText: "Visit every __location__ in the North region.",
    section: "Regions",
    icon: "🌉",
  },
  {
    id: "central_master",
    name: "Central Master",
    unlockText: "Visit every __location__ in the Central region.",
    section: "Regions",
    icon: "🏙️",
  },
  {
    id: "east_master",
    name: "East Master",
    unlockText: "Visit every __location__ in the East region.",
    section: "Regions",
    icon: "⛵",
  },
  {
    id: "south_master",
    name: "South Master",
    unlockText: "Visit every __location__ in the South region.",
    section: "Regions",
    icon: "🎡",
  },
  {
    id: "west_master",
    name: "West Master",
    unlockText: "Visit every __location__ in the West region.",
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
    id: "review_every___location__",
    name: "Reviewed Everything",
    unlockText: "Review every active __location__ you’ve visited.",
    section: "Reviews",
    icon: "💯",
  },

  {
    id: "completionist",
    name: "Completionist",
    unlockText: "Visit, share, and review every active __location__.",
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

function countCompleted(__locations__: __Location__Meta[], completedIds: Set<string>) {
  let n = 0;
  for (const c of __locations__) if (completedIds.has(c.id)) n++;
  return n;
}

function filterTotal(__locations__: __Location__Meta[], pred: (_c: __Location__Meta) => boolean) {
  return __locations__.filter(pred);
}

function countCompletedWhere(
  __locations__: __Location__Meta[],
  completedIds: Set<string>,
  pred: (_c: __Location__Meta) => boolean,
) {
  let n = 0;
  for (const c of __locations__) if (pred(c) && completedIds.has(c.id)) n++;
  return n;
}

function progressToThreshold(current: number, target: number) {
  if (current >= target) return { earned: true, label: null as string | null, dist: 0 };
  const left = target - current;
  return { earned: false, label: `${current} / ${target} (${left} to go)`, dist: left };
}

function timesFor____Location__s__(
  __locations__: __Location__Meta[],
  completed__Location__Ids: Set<string>,
  completedAtBy__Location__Id?: Record<string, number>,
  pred?: (_c: __Location__Meta) => boolean,
): number[] {
  if (!completedAtBy__Location__Id) return [];
  const out: number[] = [];
  for (const c of __locations__) {
    if (!completed__Location__Ids.has(c.id)) continue;
    if (pred && !pred(c)) continue;
    const t = completedAtBy__Location__Id[c.id];
    if (typeof t === "number" && Number.isFinite(t) && t > 0) out.push(t);
  }
  out.sort((a, b) => a - b);
  return out;
}

function timesForReviewed(
  __locations__: __Location__Meta[],
  reviewed__Location__Ids: Set<string>,
  reviewedAtBy__Location__Id?: Record<string, number>,
  pred?: (_c: __Location__Meta) => boolean,
): number[] {
  if (!reviewedAtBy__Location__Id) return [];
  const out: number[] = [];
  for (const c of __locations__) {
    if (!reviewed__Location__Ids.has(c.id)) continue;
    if (pred && !pred(c)) continue;
    const t = reviewedAtBy__Location__Id[c.id];
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
  required____Locations____: __Location__Meta[],
  hasIds: Set<string>,
  atById?: Record<string, number>,
): number | null {
  if (!atById) return null;
  if (required__Locations__.length === 0) return null;

  let max = 0;

  for (const c of required__Location__s) {
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
    __locations__,
    completed__Location__Ids,
    shareCount,
    shared__Location__Ids,
    reviewed__Location__Ids,
    reviewCount,
    completedAtBy__Location__Id,
    reviewedAtBy__Location__Id,
  }: {
    __locations__: __Location__Meta[];
    completed__Location__Ids: Set<string>;
    shareCount: number;
    shared__Location__Ids: Set<string>;
    reviewed__Location__Ids: Set<string>;
    reviewCount: number;
    completedAtBy__Location__Id?: Record<string, number>;
    reviewedAtBy__Location__Id?: Record<string, number>;
  },
) {
  const badgeById = indexBadges(badges);
  const active__Locations__ = __locations__.filter((c) => c.active);

  const totalAll = active__Locations__.length;
  const doneAll = countCompleted(active__Locations__, completedLocationIds);

  const totalTypeA = filterTotal(active__Locations__, (c) => c.category === "type_a").length;
  const doneTypeA = countCompletedWhere(
    active__Locations__,
    completed__Location__Ids,
    (c) => c.category === "type_a",
  );

  const totalTypeB = filterTotal(active__Locations__, (c) => c.category === "type_b").length;
  const doneTypeB = countCompletedWhere(
    active__Locations__,
    completed__Location__Ids,
    (c) => c.category === "type_b",
  );

  const totalTypeC = filterTotal(active__Locations__, (c) => c.category === "type_c").length;
  const doneTypeC = countCompletedWhere(
    active__Locations__,
    completed__Location__Ids,
    (c) => c.category === "type_c",
  );

  const regions: __Location__Region[] = ["north", "central", "east", "south", "west"];

  const regionTotals: Record<__Location__Region, number> = {
    north: filterTotal(active__Locations__, (c) => c.region === "north").length,
    central: filterTotal(active__Locations__, (c) => c.region === "central").length,
    east: filterTotal(active__Locations__, (c) => c.region === "east").length,
    south: filterTotal(active__Locations__, (c) => c.region === "south").length,
    west: filterTotal(active__Locations__, (c) => c.region === "west").length,
  };

  const regionDone: Record<__Location__Region, number> = {
    north: countCompletedWhere(
      active__Locations__,
      completed__Location__Ids,
      (c) => c.region === "north",
    ),
    central: countCompletedWhere(
      active__Location__s,
      completed__Location__Ids,
      (c) => c.region === "central",
    ),
    east: countCompletedWhere(active__Locations__, completedLocationIds, (c) => c.region === "east"),
    south: countCompletedWhere(
      active____Location__s__,
      completed__Location__Ids,
      (c) => c.region === "south",
    ),
    west: countCompletedWhere(
      active__Locations__,
      completed__Location__Ids,
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
    setProgress("__location___collector", earned, label, dist);
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
    const total = active__Locations__.length;
    const done = countCompleted(active__Locations__, reviewed__Location__Ids);
    const earned = total > 0 && done >= total;
    const label = !earned && total > 0 ? `${done} / ${total}` : null;
    const dist = total > 0 ? total - done : null;
    setProgress("review_every___location__", earned, label, dist);
  }

  // Completionist
  {
    const total = active__Locations__.length;
    let done = 0;
    for (const c of active__Locations__) {
      if (
        completed__Location__Ids.has(c.id) &&
        shared__Location__Ids.has(c.id) &&
        reviewed__Location__Ids.has(c.id)
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
  const allActiveTimes = timesFor__Locations__(
    active__Locations__,
    completed__Location__Ids,
    completedAtBy__Location__Id,
  );

  // Calculate a global fallback time (the time of your most recently completed __location__)
  const globalLatestTime =
    allActiveTimes.length > 0 ? allActiveTimes[allActiveTimes.length - 1] : 0;

  const typeATimes = timesFor__Locations__(
    active__Locations__,
    completed__Location__Ids,
    completedAtBy__Location__Id,
    (c) => c.category === "type_a",
  );
  const typeBTimes = timesFor__Locations__(
    active__Locations__,
    completed__Location__Ids,
    completedAtBy__Location__Id,
    (c) => c.category === "type_b",
  );
  const typeCTimes = timesFor__Locations__(
    active__Locations__,
    completed__Location__Ids,
    completedAtBy__Location__Id,
    (c) => c.category === "type_c",
  );
  const reviewTimes = timesForReviewed(active__Locations__, reviewedLocationIds, reviewedAtByLocationId);

  const unlockAtByBadgeId: Record<string, number | null> = Object.create(null);

  unlockAtByBadgeId["first_steps"] = nthTime(allActiveTimes, 1);
  unlockAtByBadgeId["explorer"] = nthTime(allActiveTimes, 5);
  unlockAtByBadgeId["wayfinder"] = nthTime(allActiveTimes, 10);
  unlockAtByBadgeId["halfway_there"] = nthTime(allActiveTimes, 20);
  unlockAtByBadgeId["__location___collector"] = maxTimeForAllRequired(
    active__Locations__,
    completed__Location__Ids,
    completedAtBy__Location__Id,
  );

  unlockAtByBadgeId["first_type_a"] = nthTime(typeATimes, 1);
  unlockAtByBadgeId["type_a_fan"] = nthTime(typeATimes, 10); 
  unlockAtByBadgeId["all_type_a"] = maxTimeForAllRequired(
    active__Locations__.filter((c) => c.category === "type_a"),
    completed__Location__Ids,
    completedAtBy__Location__Id,
  );
  unlockAtByBadgeId["first_type_b"] = nthTime(typeBTimes, 1);
  unlockAtByBadgeId["five_type_b"] = nthTime(typeBTimes, 5);
  unlockAtByBadgeId["all_type_b"] = maxTimeForAllRequired(
    active__Locations__.filter((c) => c.category === "type_b"),
    completed__Location__Ids,
    completedAtBy__Location__Id,
  );
  unlockAtByBadgeId["first_type_c"] = nthTime(typeCTimes, 1);
  unlockAtByBadgeId["all_type_c"] = maxTimeForAllRequired(
    active__Locations__.filter((c) => c.category === "type_c"),
    completed__Location__Ids,
    completedAtBy__Location__Id,
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
      active__Locations__.filter((c) => c.region === r),
      completed__Location__Ids,
      completedAtBy__Location__Id,
    );
  }

  unlockAtByBadgeId["first_review"] = nthTime(reviewTimes, 1);
  unlockAtByBadgeId["critic"] = nthTime(reviewTimes, 5);
  unlockAtByBadgeId["trusted_reviewer"] = nthTime(reviewTimes, 10);
  unlockAtByBadgeId["review_every___location__"] = maxTimeForAllRequired(
    active__Locations__,
    reviewed__Location__Ids,
    reviewedAtBy__Location__Id,
  );

  {
    const earned = earnedIds.has("completionist");
    if (!earned) {
      unlockAtByBadgeId["completionist"] = null;
    } else {
      let max = 0;
      for (const c of active__Locations__) {
        const t1 = completedAtBy__Location__Id?.[c.id] ?? 0;
        const t2 = reviewedAtBy__Location__Id?.[c.id] ?? 0;
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