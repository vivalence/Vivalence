import * as jose from "jose";
import { JSONFilePreset } from "lowdb/node";

let db;
let secret;
let jwtExpiresIn = "1d";
let refreshExpiresIn = "180d";

async function createJWT(payload, expiration = jwtExpiresIn) {
  return await new jose.SignJWT(payload)
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

  db.data.refresh[refreshToken] = { ...payload, createdAt: Date.now() };
  await db.write();

  return refreshToken;
}

async function revokeRefreshToken(refreshToken) {
  delete db.data.refresh[refreshToken];
  await db.write();
}

const isRefreshTokenValid = (refreshToken) => {
  return refreshToken in db.data.refresh;
};

const jwt = { create: createJWT, verify: verifyJWT };
const refreshtoken = {
  create: createRefreshToken,
  revoke: revokeRefreshToken,
  verify: isRefreshTokenValid,
};

export default async function (service) {
  secret = new TextEncoder().encode(service.config.secret);

  const tokenfile = service.config.data + "/tokens.json";
  db = await JSONFilePreset(tokenfile, { refresh: {} });
  await db.read();

  return { jwt, refreshtoken };
}

// import * as jose from "jose";
// import { JSONFilePreset } from "lowdb/node";

// const db = await JSONFilePreset("./tokens.json", { refresh: {} });
// await db.read();

// // db.data.refreshTokens[token] = data;
// // await db.write();

// // // refreshTokens.delete(token) becomes:
// // delete db.data.refreshTokens[token];
// // await db.write();

// // // refreshTokens.has(token) becomes:
// // token in db.data.refreshTokens

// async function createJWT(payload, secret, expiresIn = "15m") {
//   const jwt = await new jose.SignJWT(payload)
//     .setProtectedHeader({ alg: "HS256" })
//     .setIssuedAt()
//     .setExpirationTime(expiresIn)
//     .sign(secret);
//   return jwt;
// }

// async function verifyJWT(token, secret) {
//   const { payload } = await jose.jwtVerify(token, secret);
//   return payload;
// }

// async function createRefreshToken(payload, secret, expiresIn = "28d") {
//   const refreshToken = await new jose.SignJWT(payload)
//     .setProtectedHeader({ alg: "HS256" })
//     .setIssuedAt()
//     .setExpirationTime(expiresIn)
//     .sign(secret);

//   refreshTokens.set(refreshToken, { ...payload, createdAt: Date.now() });
//   return refreshToken;
// }

// function revokeRefreshToken(refreshToken) {
//   refreshTokens.delete(refreshToken);
// }

// function isRefreshTokenValid(refreshToken) {
//   return refreshTokens.has(refreshToken);
// }

// export const jwt = {
//   create: createJWT,
//   verify: verifyJWT,
// };

// export const refreshtoken = {
//   create: createRefreshToken,
//   revoke: revokeRefreshToken,
//   verify: isRefreshTokenValid,
// };
