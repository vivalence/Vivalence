import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const allowedOrigins = ["localhost(:[0-9]+)?", "*.vivalence.com", "*vivalence.com"];

function isOriginAllowed(origin, allowedOrigins) {
  const regexPatterns = allowedOrigins.map((pattern) => {
    const adjustedPattern = pattern
      .replace(/^[^.]+/, "(http|https)://$&")
      .replace(/\./g, "\\.")
      .replace(/\*/g, ".*")
      .replace(/(:[0-9]+)?$/, "(:[0-9]+)?");
    return new RegExp(`^${adjustedPattern}$`);
  });
  return regexPatterns.some((regex) => regex.test(origin));
}

// export default oakCors({origin: (requestOrigin) => {console.log("requestOrigin", requestOrigin); if (isOriginAllowed(requestOrigin, allowedOrigins)) {return requestOrigin;} return false;}, credentials: true, allowHeaders: ["Content-Type", "Authorization", "Cookie"],});

const cors = oakCors({
  origin: (requestOrigin) => {
    console.log(`[CUSTOM] CORS origin check for: ${requestOrigin}`);
    if (isOriginAllowed(requestOrigin, allowedOrigins)) {
      console.log(`[CUSTOM] CORS origin allowed: ${requestOrigin}`);
      return requestOrigin;
    }
    console.log(`[CUSTOM] CORS origin not allowed: ${requestOrigin}`);
    return false;
  },
  // credentials: true,
  // allowHeaders: ["Content-Type", "Authorization", "Cookie"],
});
export { cors };
