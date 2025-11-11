import { Status } from "@vivalence/typology";
import * as shards from "@vivalence/vector/shards";

import { inject, expose, systemmap } from "./entities.js";
import * as authority from "./authority.js";
import * as identity from "./identity.js";

// TODO: universal mask first.
export default async function server(aperture, service) {
  const { orm, entities } = await systemmap(service, aperture);

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
    .use(inject(orm))
    .use(identity.inject());

  authority.expose(service, aperture);
  expose(service, aperture);
}
