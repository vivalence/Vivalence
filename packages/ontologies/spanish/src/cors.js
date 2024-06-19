import cors from "@koa/cors";

const allowedOrigins = [
    // env.SERVER_CLIENT_PATH
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
        const requestOrigin = ctx.request.header.origin;
        if (isOriginAllowed(requestOrigin, allowedOrigins)) {
            return requestOrigin;
        }

        return false;
    },
    credentials: true
});
