const origins = ["localhost(:[0-9]+)?", "127.0.0.1", "*.vivalence.com", "*vivalence.com"];

const patterns = origins.map((origin) => {
  const adjusted = origin
    .replace(/^[^.]+/, "(http|https)://$&")
    .replace(/\./g, "\\.")
    .replace(/\*/g, ".*")
    .replace(/(:[0-9]+)?$/, "(:[0-9]+)?");
  return new RegExp(`^${adjusted}$`);
});

const allowed = (origin) => patterns.some((re) => re.test(origin));

function headers(origin) {
  const h = {};
  if (origin && allowed(origin)) {
    h["access-control-allow-origin"] = origin;
    h["access-control-allow-credentials"] = "true";
    h["vary"] = "Origin";
  } else if (!origin) {
    h["access-control-allow-origin"] = "*";
  }
  return h;
}

export function wrap(serve) {
  return async (req) => {
    // console.log({ req });
    const origin = req.headers.get("origin");

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...headers(origin),
          "access-control-allow-methods": req.headers.get("access-control-request-method") || "*",
          "access-control-allow-headers": req.headers.get("access-control-request-headers") || "*",
          "access-control-max-age": "86400",
        },
      });
    }

    const res = await serve(req);
    const merged = new Headers(res.headers);
    for (const [k, v] of Object.entries(headers(origin))) merged.set(k, v);

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: merged,
    });
  };
}
