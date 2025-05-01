// import { BaseEntity, Collection, EntitySchema, type Opt } from "@mikro-orm/core";
// import { Condition } from "../3_curriculum/Condition.ts";
// import { Curriculum } from "../2_runtime/Curriculum.ts";
// import { Dependency } from "../3_curriculum/Dependency.ts";
// import { HEAD } from "../5_transient/HEAD.ts";
// import { Memory } from "../4_userland/Memory.ts";
// import { Play } from "../4_userland/Play.ts";
// import { Queue } from "../5_transient/Queue.ts";
// import { Runtime } from "../1_repo/Runtime.ts";
// import { Session } from "../4_userland/Session.ts";
// import { Strategy } from "../2_runtime/Strategy.ts";

// traits: [Agentic]
// AGENTIC = "AGENTIC",

// export class User extends BaseEntity {
//   id!: string;
//   roles?: string[];
//   config: any & Opt = "{}";
//   createdAt!: Date & Opt;
//   updatedAt!: Date & Opt;
//   conditionCollection = new Collection<Condition>(this);
//   curriculumCollection = new Collection<Curriculum>(this);
//   dependencyCollection = new Collection<Dependency>(this);
//   hEADCollection = new Collection<HEAD>(this);
//   memoryCollection = new Collection<Memory>(this);
//   playCollection = new Collection<Play>(this);
//   queueCollection = new Collection<Queue>(this);
//   RuntimeToUserInverse = new Collection<Runtime>(this);
//   sessionCollection = new Collection<Session>(this);
//   strategyCollection = new Collection<Strategy>(this);
// }

// export const UserSchema = new EntitySchema({
//   class: User,
//   tableName: "User",
//   properties: {
//     id: { primary: true, type: "text" },
//     roles: {
//       type: "string[]",
//       columnType: "UserRolesEnum[]",
//       nullable: true,
//       defaultRaw: `ARRAY['USER'::"UserRolesEnum"]`,
//     },
//     config: { type: "json" },
//     createdAt: {
//       type: "datetime",
//       fieldName: "createdAt",
//       columnType: "timestamp(3)",
//       defaultRaw: `CURRENT_TIMESTAMP`,
//     },
//     updatedAt: {
//       type: "datetime",
//       fieldName: "updatedAt",
//       columnType: "timestamp(3)",
//       defaultRaw: `CURRENT_TIMESTAMP`,
//     },
//     conditionCollection: {
//       kind: "1:m",
//       entity: () => Condition,
//       mappedBy: "user",
//     },
//     curriculumCollection: {
//       kind: "1:m",
//       entity: () => Curriculum,
//       mappedBy: "user",
//     },
//     dependencyCollection: {
//       kind: "1:m",
//       entity: () => Dependency,
//       mappedBy: "user",
//     },
//     hEADCollection: { kind: "1:m", entity: () => HEAD, mappedBy: "user" },
//     memoryCollection: { kind: "1:m", entity: () => Memory, mappedBy: "user" },
//     playCollection: { kind: "1:m", entity: () => Play, mappedBy: "user" },
//     queueCollection: { kind: "1:m", entity: () => Queue, mappedBy: "user" },
//     RuntimeToUserInverse: {
//       kind: "m:n",
//       entity: () => Runtime,
//       mappedBy: "RuntimeToUser",
//     },
//     sessionCollection: { kind: "1:m", entity: () => Session, mappedBy: "user" },
//     strategyCollection: {
//       kind: "1:m",
//       entity: () => Strategy,
//       mappedBy: "user",
//     },
//   },
// });
