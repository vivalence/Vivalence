import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { AnalyticsUsers } from "./AnalyticsUsers.ts";
import { PaymentMethods } from "./PaymentMethods.ts";

export class BillingAccounts extends BaseModuleEntity {
  id!: bigint;
  latestSuccessfulStripeSession?: any;
  stripeCustomer?: string;
  user?: Rel<AnalyticsUsers>;
  insertedAt!: Date;
  updatedAt!: Date;
  stripeSubscriptions?: any;
  stripeInvoices?: any;
  "lifetimePlan?"?: boolean = false;
  lifetimePlanInvoice?: string;
  defaultPaymentMethod?: string;
  customInvoiceFields?: string[];
  lifetimePlan: boolean & Opt = false;
  paymentMethodsCollection = new Collection<PaymentMethods>(this);
}

export const BillingAccountsSchema = new EntitySchema({
  class: BillingAccounts,
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "bigint" },
    latestSuccessfulStripeSession: { type: "json", nullable: true },
    stripeCustomer: {
      type: "string",
      nullable: true,
      unique: "billing_accounts_stripe_customer_index",
    },
    user: {
      kind: "1:1",
      entity: () => AnalyticsUsers,
      deleteRule: "cascade",
      nullable: true,
      unique: "billing_accounts_user_id_index",
    },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
    stripeSubscriptions: { type: "json", nullable: true },
    stripeInvoices: { type: "json", nullable: true },
    "lifetimePlan?": { type: "boolean", nullable: true },
    lifetimePlanInvoice: { type: "string", nullable: true },
    defaultPaymentMethod: { type: "string", nullable: true },
    customInvoiceFields: {
      type: "string[]",
      columnType: "jsonb[]",
      nullable: true,
      defaultRaw: `ARRAY[]::jsonb[]`,
    },
    lifetimePlan: { type: "boolean" },
    paymentMethodsCollection: {
      kind: "1:m",
      entity: () => PaymentMethods,
      mappedBy: "customer",
    },
  },
});
