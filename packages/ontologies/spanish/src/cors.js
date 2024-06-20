import cors from "@koa/cors";

const allowedOrigins = [
    //
    "localhost(:[0-9]+)?",
    "*.vivalence.com"
];

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

export default cors({
    origin: (ctx) => {
        const requestOrigin = ctx.get("Origin") || "*";
        console.log("Request Origin:", requestOrigin);

        if (isOriginAllowed(requestOrigin, allowedOrigins)) {
            console.log("Allowed origin:", requestOrigin);
            return requestOrigin;
        }

        console.log("Disallowed origin:", requestOrigin);
        return false;
    },
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization", "Cookie"]
});
