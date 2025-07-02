import { EntitySchema } from "@mikro-orm/core";
import { UserEntity, UserSchema as _UserSchema } from "@vivalence/entities"; // applied to `global.db`
// console.log("_UserSchema ", _UserSchema._meta.properties);

export { UserEntity };

export const UserSchema = new EntitySchema<UserEntity>({
  name: "User",
  expression: `select * from daemon.User;`,
  properties: _UserSchema._meta.properties,
  // extends: _UserSchema,
});
