import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { SavedSearches } from "./SavedSearches.ts";

export class SavedSearchCounters extends BaseModuleEntity {
  id!: bigint;
  timestamp!: Date;
  savedSearch!: Rel<SavedSearches>;
  granularity: string & Opt = "day";
  nonTailingCount?: number;
  tailingCount?: number;
}

export const SavedSearchCountersSchema = new EntitySchema({
  class: SavedSearchCounters,
  schema: "_analytics",
  uniques: [
    {
      name: "saved_search_counters_timestamp_saved_search_id_granularity_ind",
      expression:
        'CREATE UNIQUE INDEX saved_search_counters_timestamp_saved_search_id_granularity_ind ON _analytics.saved_search_counters USING btree ("timestamp", saved_search_id, granularity)',
      properties: ["timestamp", "savedSearch", "granularity"],
    },
  ],
  properties: {
    id: { primary: true, type: "bigint" },
    timestamp: { type: "datetime", columnType: "timestamp(6)" },
    savedSearch: {
      kind: "m:1",
      entity: () => SavedSearches,
      deleteRule: "cascade",
    },
    granularity: { type: "text" },
    nonTailingCount: { type: "integer", nullable: true },
    tailingCount: { type: "integer", nullable: true },
  },
});
