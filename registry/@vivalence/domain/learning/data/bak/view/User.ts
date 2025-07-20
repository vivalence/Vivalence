import { EntitySchema } from "@mikro-orm/core";
import * as entities from "@vivalence/entities"; // applied to `global.db`

// console.log("_UserSchema ", _UserSchema._meta.properties);
export const UserEntity = entities.UserEntity;

// const beforeCreate = (args) => args.entity.version++;

function beforeUpdate() {
  console.log("before update");
  // console.log(this);
}

export const UserSchema = new EntitySchema({
  class: UserEntity,
  // tableName: "User",

  // extends: entities.UserSchema,
  properties: entities.UserSchema._meta.properties,

  // hooks: {
  //   beforeUpdate: [beforeUpdate],
  //   // beforeCreate: [beforeCreate],
  // },
  // extends: _UserSchema,
  // hooks:[]

  // expression: `select * from daemon.User;`,
  // properties: _UserSchema._meta.properties,
});


import { Injectable } from '@nestjs/common';
import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';

export class AuthorSubscriber implements EventSubscriber<Author> {

  constructor(em: EntityManager) {
    em.getEventManager().registerSubscriber(this);
  }

  getSubscribedEntities(): EntityName<Author>[] {
    return [Author];
  }

  async afterCreate(args: EventArgs<Author>): Promise<void> {
    // ...
  }

  async afterUpdate(args: EventArgs<Author>): Promise<void> {
    // ...
  }

}

import { EventArgs, TransactionEventArgs, EventSubscriber } from '@mikro-orm/core';

export class EverythingSubscriber implements EventSubscriber {

  // entity life cycle events
  // onInit<T>(args: EventArgs<T>): void { ... }
  // async onLoad<T>(args: EventArgs<T>): Promise<void> { ... }
  async beforeCreate<T>(args: EventArgs<T>): Promise<void> { ... }
  async afterCreate<T>(args: EventArgs<T>): Promise<void> { ... }

  async beforeUpdate<T>(args: EventArgs<T>): Promise<void> { ... }
  async afterUpdate<T>(args: EventArgs<T>): Promise<void> { ... }

  async beforeUpsert<T>(args: EventArgs<T>): Promise<void> { ... }
  async afterUpsert<T>(args: EventArgs<T>): Promise<void> { ... }

  async beforeDelete<T>(args: EventArgs<T>): Promise<void> { ... }
  async afterDelete<T>(args: EventArgs<T>): Promise<void> { ... }

  // // flush events
  // async beforeFlush<T>(args: FlushEventArgs): Promise<void> { ... }
  // async onFlush<T>(args: FlushEventArgs): Promise<void> { ... }
  // async afterFlush<T>(args: FlushEventArgs): Promise<void> { ... }

  // // transaction events
  // async beforeTransactionStart(args: TransactionEventArgs): Promise<void> { ... }
  // async afterTransactionStart(args: TransactionEventArgs): Promise<void> { ... }
  // async beforeTransactionCommit(args: TransactionEventArgs): Promise<void> { ... }
  // async afterTransactionCommit(args: TransactionEventArgs): Promise<void> { ... }
  // async beforeTransactionRollback(args: TransactionEventArgs): Promise<void> { ... }
  // async afterTransactionRollback(args: TransactionEventArgs): Promise<void> { ... }

}
