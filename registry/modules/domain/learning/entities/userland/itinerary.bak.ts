import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { UserEntity, BaseEntity, BaseSchema } from "@vivalence/entities";

export class ItineraryEntity extends BaseEntity {
  user!: Rel<UserEntity>;
  data: any & Opt = {};
}

export const ItinerarySchema = new EntitySchema<ItineraryEntity, BaseEntity>({
  class: ItineraryEntity,
  extends: BaseSchema,
  tableName: "Itinerary",
  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    data: { type: "json" },
  },
});
