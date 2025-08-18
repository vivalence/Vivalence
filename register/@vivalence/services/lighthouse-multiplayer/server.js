import createJWT from "./lib/jwt.js";
import identities from "./lib/identities.js";

export default async function server(service, aperture) {
  const { jwt, refreshtoken } = await createJWT(service);

  aperture.open("/manifest", async (input, ctx) => {
    return { ...service.manifest };
  });
  aperture.open("/status", async (input, ctx) => {
    return { status: "success" };
  });

  aperture.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      console.log("[identity server error]", error.name, error.code);
      if (error.code === "ERR_JWT_EXPIRED") {
        ctx.response.status = 401;
        ctx.response.body = { error };
      } else {
        console.error(error);
        throw error;
      }
    }
  });

  aperture
    .branch("/auth")
    .open("/login", async (input, ctx) => {
      const { username, password } = input;

      const identity = identities.identify({ username, password });
      console.log({ identity });
      if (!identity) {
        ctx.response.status = 400;
        return { success: false };
      }

      const accessToken = await jwt.create({
        id: identity.id,
        type: "access",
      });

      const refreshToken = await refreshtoken.create({
        id: identity.id,
        type: "refresh",
      });

      return {
        token: {
          access: accessToken,
          refresh: refreshToken,
        },
        identity,
      };
    })
    .open("/refresh", async (input, ctx) => {
      const { refresh } = input;

      if (!refreshtoken.verify(refresh)) {
        ctx.response.status = 401;
        return {};
        // throw new Error("Invalid refresh token");
      }

      const payload = await jwt.verify(refresh);
      if (!payload || payload.type !== "refresh") {
        ctx.response.status = 401;
        return {};
        // throw new Error("Invalid refresh token");
      }

      const identity = identities.findOne({ id: payload.id });
      if (!identity) {
        ctx.response.status = 401;
        return {};
        // throw new Error("Identity not found");
      }

      const newAccessToken = await jwt.create({
        id: identity.id,
        username: identity.username,
        type: "access",
      });

      return {
        access: newAccessToken,
      };
    })
    .open("/verify", async (input, ctx) => {
      const { access } = input;

      const payload = await jwt.verify(access);
      if (!payload || payload.type !== "access") {
        ctx.response.status = 401;
        return { valid: false };
      }

      const identity = identities.findOne({ id: payload.id });
      if (!identity) {
        ctx.response.status = 400;
        return { valid: false };
      }
      return { valid: true };
    })
    .open("/logout", async (input, ctx) => {
      const { refreshToken } = input;

      if (refreshToken) {
        refreshtoken.revoke(refreshToken);
      }

      return { success: true };
    });
}

// aperture.open("/register", async (input, ctx) => {const { username, password } = input; if (identities.find((id) => id.username === username)) {throw new Error("Username already exists");} const newIdentity = {id: String(Date.now()), username, passwordHash: hashPassword(password), roles: ["user"],}; identities.push(newIdentity); const accessToken = await createJWT({id: newIdentity.id, username: newIdentity.username, roles: newIdentity.roles, type: "access",}, secret, "15m",); const refreshToken = await createRefreshToken(newIdentity.id, secret); return {accessToken, refreshToken, expiresIn: 15 * 60, identity: {id: newIdentity.id, username: newIdentity.username, roles: newIdentity.roles,},};});
