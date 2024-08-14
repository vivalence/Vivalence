import createSupabaseUserClient from "./user.js";
import createSupabaseAdminClient from "./admin.js";

export default {
  createUserClient: (ctx) => createSupabaseUserClient(ctx),
  createAdminClient: (ctx) => createSupabaseAdminClient(ctx),
};
