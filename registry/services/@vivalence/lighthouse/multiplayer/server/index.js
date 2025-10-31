import * as shards from "@vivalence/vector/shards";

import * as entities from "./entities.js";
import * as authority from "./authority.js";
import * as identity from "./identity.js";

export default async function server(service, aperture) {
  const { orm, entities } = await entities.systemmap(service, aperture);

  aperture
    .use(async (ctx, next) => {
      try {
        await next();
      } catch (error) {
        console.log("[identity service server error]", error.name, error.code);
        if (error.code === "ERR_JWT_EXPIRED") {
          ctx.response.status = 401;
          ctx.response.body = { error };
        } else {
          console.error(error);
          throw error;
        }
      }
    })
    .use(await authority.inject(service))
    .use(entities.inject(orm))
    .use(identity.inject());

  aperture.open("/manifest", async (input, ctx) => {
    return { ...service.manifest };
  });

  aperture.open("/status", shards.aperture.status);

  authority.expose(service, aperture);
  entities.expose(service, aperture);
}
