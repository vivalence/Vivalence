import { Status } from "@vivalence/typology";

import * as entity from "./entities.js";
import * as authority from "./authority.js";
import * as identity from "./identity.js";
// import { inject, expose, systemmap } from "./entities.js";

// TODO: universal mask first.
export default async function server(aperture, service) {
  const { orm, entities } = await entity.systemmap(service, aperture);

  aperture
    .use(async (ctx, next) => {
      try {
        await next();
      } catch (error) {
        console.log(
          "[@lighthouse/multiplayer] service error",
          error.name,
          error.code,
        );
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
    .use(entity.inject(orm))
    .use(identity.inject());

  authority.expose(service, aperture);
  entity.expose(service, aperture);
}
