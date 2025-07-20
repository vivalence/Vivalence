import { EntitySchema } from "@mikro-orm/core";
import * as entities from "@vivalence/entities"; // applied to `global.db`
// console.log("_IntentSchema ", _IntentSchema._meta.properties);

export const IntentEntity = entities.IntentEntity;

const beforeCreate = (args) => args.entity.version++;

function beforeUpdate() {
  console.log("before update");
  console.log(this);
}

export const IntentSchema = new EntitySchema({
  class: IntentEntity,
  properties: entities.IntentSchema._meta.properties,
  tableName: "Intent",

  hooks: {
    beforeUpdate: [beforeUpdate],
    beforeCreate: [beforeCreate],
  },
});
