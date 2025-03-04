import { oakCors } from "https://deno.land/x/cors/mod.ts";

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

export default oakCors({
  origin: (requestOrigin) => {
    if (!requestOrigin) return true;
    if (isOriginAllowed(requestOrigin, allowedOrigins)) return true;
    return false;
  },
  credentials: true,
  allowMethods: ["*"],
  allowHeaders: ["*"]
  // allowHeaders: ["Content-Type", "Authorization", "Cookie"]
});
