import config from "@vivalence/config";
import { colors } from "@vivalence/interfaces-cli";

const create = (viva) => ({
  name: "create",
  description: "Create the local user in the database.",
  action: async (v) => {
    // console.log("viva db", viva.services.db.sql, config.identity.singleplayer.user.id);
    const result = await viva.services.db.sql(`
    INSERT INTO public."User" (id)
    VALUES( '${config.identity.singleplayer.user.id}' )
    RETURNING *;
    `);
    // console.log(result.rows[0]);
    console.log(colors.green("User created"));
  },
});

// VALUES( ARRAY['USER'::"UserRolesEnum"], '{}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
export default async function (viva) {
  return [create].reduce((acc, fn) => {
    const command = fn(viva);
    acc[command.name] = {
      ...command,
      action: async () => {
        await command.action();
      },
    };
    return acc;
  }, {});
}
