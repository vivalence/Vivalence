const allowedOrigins = ["localhost(:[0-9]+)?", "*.vivalence.com", "*vivalence.com"]; // i know.

const originPatterns = allowedOrigins.map((pattern) => {
  const adjusted = pattern
    .replace(/^[^.]+/, "(http|https)://$&")
    .replace(/\./g, "\\.")
    .replace(/\*/g, ".*")
    .replace(/(:[0-9]+)?$/, "(:[0-9]+)?");
  return new RegExp(`^${adjusted}$`);
});

const isOriginAllowed = (origin) => originPatterns.some((regex) => regex.test(origin));

export const cors = async (ctx, next) => {
  const origin = ctx.request.headers.get("origin");

  if (origin && isOriginAllowed(origin)) {
    ctx.response.headers.set("Access-Control-Allow-Origin", origin);
    ctx.response.headers.set("Access-Control-Allow-Credentials", "true");
    ctx.response.headers.set("Vary", "Origin");
  } else if (!origin) {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  }

  if (ctx.request.method === "OPTIONS") {
    ctx.response.headers.set(
      "Access-Control-Allow-Methods",
      ctx.request.headers.get("access-control-request-method") || "*",
    );
    ctx.response.headers.set(
      "Access-Control-Allow-Headers",
      ctx.request.headers.get("access-control-request-headers") || "*",
    );
    ctx.response.headers.set("Access-Control-Max-Age", "86400");
    ctx.response.status = 204;
    return;
  }

  await next();
};

export const notFound = async (ctx, next) => {
  const originalStatus = ctx.response.status;
  const originalBody = ctx.response.body;
  await next();
  if (ctx.response.status !== originalStatus || ctx.response.body !== originalBody) {
    ctx.response.status = ctx.response.status === 404 ? 404 : ctx.response.status || 200;
  } else {
    ctx.response.status = 404;
    ctx.response.body = "URL Not Found";
  }
};

// import { cors as oakCors } from "@momiji/cors";
// // import { oakCors } from "cors";

// const allowedOrigins = ["localhost(:[0-9]+)?", "*.vivalence.com", "*vivalence.com"];

// function isOriginAllowed(origin, allowedOrigins) {
//   const regexPatterns = allowedOrigins.map((pattern) => {
//     const adjustedPattern = pattern
//       .replace(/^[^.]+/, "(http|https)://$&")
//       .replace(/\./g, "\\.")
//       .replace(/\*/g, ".*")
//       .replace(/(:[0-9]+)?$/, "(:[0-9]+)?");
//     return new RegExp(`^${adjustedPattern}$`);
//   });
//   return regexPatterns.some((regex) => regex.test(origin));
// }

// export const cors = oakCors({
//   origin: (requestOrigin) => {
//     if (!requestOrigin) return true;
//     if (isOriginAllowed(requestOrigin, allowedOrigins)) return true;
//     return false;
//   },
//   credentials: true,
//   allowMethods: ["*"],
//   allowHeaders: ["*"],
//   // allowHeaders: ["Content-Type", "Authorization", "Cookie"]
// });

// export const notFound = async function (ctx, next) {
//   const originalStatus = ctx.response.status;
//   const originalBody = ctx.response.body;

//   await next();

//   if (ctx.response.status !== originalStatus || ctx.response.body !== originalBody) {
//     ctx.response.status = ctx.response.status === 404 ? 404 : ctx.response.status || 200;
//   } else {
//     ctx.response.status = 404;
//     ctx.response.body = "URL Not Found";
//   }
// };
