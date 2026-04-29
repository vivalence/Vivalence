// todo reintegrate entities from corpus
import { DataEntity } from "./DataEntity.ts";
import { defineEntity } from "@mikro-orm/core";

export const properties = defineEntity.properties;

export class Entity extends DataEntity {
  // id!: number;
  // createdAt!: Date;
  // updatedAt!: Date;
  // slug = "";
  // name = "";
  // description = "";
}

const p = properties;
export const base = {
  id: p.integer().primary(),
  createdAt: p.datetime().onCreate(() => new Date()),
  updatedAt: p
    .datetime()
    .onCreate(() => new Date())
    .onUpdate(() => new Date()),
  slug: p.string(),
  name: p.string(),
  description: p.string(),
};

// export const Book = defineEntity({
//   name: 'Book',
//   properties: p => ({
//     ...baseProperties,
//     title: p.string(),
//     author: () => p.manyToOne(Author).inversedBy('books'),
//     publisher: () => p.oneToOne(Publisher).inversedBy('book'),
//     tags: () => p.manyToMany(BookTag).inversedBy('books').fixedOrder(),
//   }),
// });
