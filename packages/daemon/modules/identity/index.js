// TODO:
// create default USER IDENTITY SYSTEM as defined by config.
// setup a function for the runtime to pull it
// if the runtime.config doesnt specify its own.
// CURRENTLY handled by supabase

// must provide interface for clients to create, identify and authenticate users.

// export default async function userManagement(daemon) {
//   router.route("/v/user/on/signup", async (body, ctx) => {
//     // @domain:user-join
//     const { data: user } = await ctx.locals.supabase
//       .from("AppUser")
//       .select("*")
//       .eq("id", body.user.id)
//       .single();

//     const defaultRuntimeConfig = {
//       runtime: { slug: "", strategy: { slug: "" } },
//     };

//     const config = { ...user.config, ...defaultRuntimeConfig };

//     const { data } = await runtime.locals.supabase
//       .from("AppUser")
//       .update({ config })
//       .eq("id", body.user.id)
//       .select("*")
//       .single();

//     return { data };
//   });

//   return { ...params, router };
// }
