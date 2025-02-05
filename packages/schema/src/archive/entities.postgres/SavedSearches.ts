import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { SavedSearchCounters } from "./SavedSearchCounters.ts";
import { Sources } from "./Sources.ts";

export class SavedSearches extends BaseModuleEntity {
  id!: bigint;
  querystring?: string;
  source?: Rel<Sources>;
  insertedAt!: Date;
  updatedAt!: Date;
  savedByUser?: boolean;
  lqlFilters?: any;
  lqlCharts?: any;
  "tailing?": boolean & Opt = true;
  tailing: boolean & Opt = true;
  savedSearchCountersCollection = new Collection<SavedSearchCounters>(this);
}

export const SavedSearchesSchema = new EntitySchema({
  class: SavedSearches,
  schema: "_analytics",
  uniques: [
    {
      name: "saved_searches_querystring_source_id_index",
      properties: ["querystring", "source"],
    },
  ],
  properties: {
    id: { primary: true, type: "bigint" },
    querystring: { type: "text", nullable: true },
    source: {
      kind: "m:1",
      entity: () => Sources,
      deleteRule: "cascade",
      nullable: true,
    },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
    savedByUser: { type: "boolean", nullable: true },
    lqlFilters: { type: "json", nullable: true },
    lqlCharts: { type: "json", nullable: true },
    "tailing?": { type: "boolean" },
    tailing: { type: "boolean" },
    savedSearchCountersCollection: {
      kind: "1:m",
      entity: () => SavedSearchCounters,
      mappedBy: "savedSearch",
    },
  },
});
