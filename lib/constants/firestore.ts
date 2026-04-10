export const COL = {
  locations: "locations",
  locationCompletions: "locationCompletions",
  locationReviews: "locationReviews",
  reports: "reports",
  blocks: "blocks",
} as const;

export type CollectionName = (typeof COL)[keyof typeof COL];