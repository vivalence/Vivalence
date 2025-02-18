import { BaseModuleEntity, EntitySchema, type Rel } from '@mikro-orm/core';
import { BillingAccounts } from './BillingAccounts.ts';

export class PaymentMethods extends BaseModuleEntity {
  id!: bigint;
  stripeId?: string;
  priceId?: string;
  lastFour?: string;
  brand?: string;
  expYear?: number;
  expMonth?: number;
  customer?: Rel<BillingAccounts>;
  insertedAt!: Date;
  updatedAt!: Date;
}

export const PaymentMethodsSchema = new EntitySchema({
  class: PaymentMethods,
  schema: '_analytics',
  properties: {
    id: { primary: true, type: 'bigint' },
    stripeId: {
      type: 'string',
      nullable: true,
      unique: 'payment_methods_stripe_id_index',
    },
    priceId: { type: 'string', nullable: true },
    lastFour: { type: 'string', nullable: true },
    brand: { type: 'string', nullable: true },
    expYear: { type: 'integer', nullable: true },
    expMonth: { type: 'integer', nullable: true },
    customer: {
      kind: 'm:1',
      entity: () => BillingAccounts,
      fieldName: 'customer_id',
      deleteRule: 'cascade',
      nullable: true,
      index: true,
    },
    insertedAt: { type: 'datetime', columnType: 'timestamp(0)' },
    updatedAt: { type: 'datetime', columnType: 'timestamp(0)' },
  },
});
