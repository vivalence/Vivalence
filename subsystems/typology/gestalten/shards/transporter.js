import { Response } from "@vivalence/typology";

// should use response object explicitly.
export const fetcher = async (ctx) => {
  const { request } = ctx;

  const options = {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      ...Object.fromEntries(request.headers),
    },
    credentials: "include",
  };

  if (request.signal) {
    options.signal = request.signal;
  }

  if (request.method !== "GET" && request.body !== undefined) {
    options.body = JSON.stringify(request.body);
  }

  const res = await fetch(request.url.absolute, options);

  const headers = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let body;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }

  ctx.response.status = res.status;
  ctx.response.headers = new Map(Object.entries(headers));
  ctx.response.body = body;
};
