// import { colors } from "@vivalence/interfaces-cli";

// VALUES( ARRAY['USER'::"UserRolesEnum"], '{}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
export default function (service, ctx) {
  return {
    create: {
      what: "Create the local user in the database.",
      do: async () => {
        // console.log("viva db", viva.services.db.sql, config.identity.singleplayer.user.id);
        //     const result = await ctx.services.db.sql(`
        // INSERT INTO public."User" (id)
        // VALUES( '${config.identity.singleplayer.user.id}' )
        // RETURNING *;
        // `);
        // console.log(colors.green("User created"));
      },
    },
  };
}
