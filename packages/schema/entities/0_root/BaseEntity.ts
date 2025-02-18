import { BaseEntity as MikroBaseEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { v7 } from "uuid";

export class BaseEntity extends MikroBaseEntity {
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;

  // constructor(data: Record<string, any> = {}) {
  //   super();
  //   Object.assign(this, data);
  // }
}

export const BaseSchema = new EntitySchema<BaseEntity>({
  class: BaseEntity,
  name: "BaseEntity",
  abstract: true,
  properties: {
    id: {
      type: String,
      primary: true,
      onCreate: () => v7(),
    },
    createdAt: {
      type: Date,
      onCreate: () => new Date(),
      lazy: true,
    },
    updatedAt: {
      type: Date,
      onCreate: () => new Date(),
      onUpdate: () => new Date(),
      lazy: true,
    },
  },
});

// import { BaseEntity as MikroBaseEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
// import { v7 } from 'uuid';

// export class BaseEntity {
//   id!: string;
//   createdAt!: Date & Opt;
//   updatedAt!: Date & Opt;

//     constructor(entity) {
//     super();

//   }

// }

// export const BaseSchema = new EntitySchema<BaseEntity>({
//   class: BaseEntity,
//   name: "BaseEntity",
//   abstract: true,
//   properties: {
//     id: { type: "text", primary: true },
//     //     id: { type: 'uuid', onCreate: () => v4(), primary: true },
//     createdAt: {
//       type: "datetime",
//       fieldName: "createdAt",
//       defaultRaw: `CURRENT_TIMESTAMP`,
//       onCreate: () => new Date(),
//     },
//     updatedAt: {
//       type: "datetime",
//       fieldName: "updatedAt",
//       defaultRaw: `CURRENT_TIMESTAMP`,
//       onCreate: () => new Date(),
//       onUpdate: () => new Date(),
//     },
//   },
// });
