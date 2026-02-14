import * as jose from "jose";
import { JSONFilePreset } from "lowdb/node";

let db;
let secret;
const jwtExpiresIn = "1d";
const refreshExpiresIn = "180d";

async function createJWT(payload, expiration = jwtExpiresIn) {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(secret);
}

async function verifyJWT(token) {
  const { payload } = await jose.jwtVerify(token, secret);
  return payload;
}

async function createRefreshToken(payload) {
  const refreshToken = await createJWT(
    { ...payload, type: "refresh" },
    refreshExpiresIn,
  );

  db.data.refresh[refreshToken] = {
    ...payload,
    createdAt: Date.now(),
    expiresAt: Date.now() + 180 * 24 * 60 * 60 * 1000,
  };
  await db.write();

  return refreshToken;
}

async function revokeRefreshToken(refreshToken) {
  delete db.data.refresh[refreshToken];
  await db.write();
}

function isRefreshTokenValid(refreshToken) {
  const entry = db.data.refresh[refreshToken];
  if (!entry) return false;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    delete db.data.refresh[refreshToken];
    return false;
  }
  return true;
}

async function cleanupExpiredTokens() {
  const now = Date.now();
  let changed = false;

  for (const [token, entry] of Object.entries(db.data.refresh)) {
    if (entry.expiresAt && now > entry.expiresAt) {
      delete db.data.refresh[token];
      changed = true;
    }
  }

  if (changed) await db.write();
}

const jwt = { create: createJWT, verify: verifyJWT };
const rft = {
  create: createRefreshToken,
  verify: isRefreshTokenValid,
  revoke: revokeRefreshToken,
  cleanup: cleanupExpiredTokens,
};

export default async function (service) {
  if (!service.secrets?.jwt) {
    throw new Error("JWT secret not configured in service.secrets.jwt");
  }

  secret = new TextEncoder().encode(service.secrets.jwt);

  const tokenfile = service.mount.branch("/tokens.json").absolute;
  db = await JSONFilePreset(tokenfile, { refresh: {} });
  await db.read();

  // Cleanup on startup
  await cleanupExpiredTokens();

  // Periodic cleanup every hour
  setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

  return { jwt, rft };
}
// import * as jose from "jose";
// import { JSONFilePreset } from "lowdb/node";

// let db;
// let secret;
// let jwtExpiresIn = "1d";
// let refreshExpiresIn = "180d";

// async function createJWT(payload, expiration = jwtExpiresIn) {
//   return await new jose.SignJWT(payload)
//     .setProtectedHeader({ alg: "HS256" })
//     .setIssuedAt()
//     .setExpirationTime(expiration)
//     .sign(secret);
// }

// async function verifyJWT(token) {
//   const { payload } = await jose.jwtVerify(token, secret);
//   return payload;
// }

// async function createRefreshToken(payload) {
//   const refreshToken = await createJWT(
//     { ...payload, type: "refresh" },
//     refreshExpiresIn,
//   );

//   db.data.refresh[refreshToken] = { ...payload, createdAt: Date.now() };
//   await db.write();

//   return refreshToken;
// }

// async function revokeRefreshToken(refreshToken) {
//   delete db.data.refresh[refreshToken];
//   await db.write();
// }

// const isRefreshTokenValid = (refreshToken) => {
//   return refreshToken in db.data.refresh;
// };

// const jwt = { create: createJWT, verify: verifyJWT };
// const rft = {
//   create: createRefreshToken,
//   verify: isRefreshTokenValid,
//   revoke: revokeRefreshToken,
// };

// export default async function (service) {
//   secret = new TextEncoder().encode(service.secrets.jwt);

//   const tokenfile = service.mount.branch("/tokens.json").absolute;
//   db = await JSONFilePreset(tokenfile, { refresh: {} });
//   await db.read();

//   return { jwt, rft };
// }
