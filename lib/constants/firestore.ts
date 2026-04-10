export const COL = {
  __locations__: "__locations__",
  __location__Completions: "__location__Completions",
  __location__Reviews: "__location__Reviews",
  reports: "reports",
  blocks: "blocks",
} as const;

export type CollectionName = (typeof COL)[keyof typeof COL];