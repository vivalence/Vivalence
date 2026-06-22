import { ConnectionError } from "@vivalence/typology";

// used in connections

export const inline = (serve) => async (ctx) => {
  const req = new Request(ctx.request.url.absolute, {
    method: ctx.request.method,
    headers: {
      "content-type": "application/json",
      ...Object.fromEntries(ctx.request.headers),
    },
    body:
      ctx.request.method !== "GET" && ctx.request.body !== undefined
        ? JSON.stringify(ctx.request.body)
        : undefined,
  });

  const res = await serve(req);

  ctx.response.status = res.status;
  res.headers.forEach((v, k) => ctx.response.headers.set(k, v));

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    ctx.response.body = await res.json().catch(() => null);
  } else if (contentType.startsWith("text/") || contentType.includes("/javascript")) {
    ctx.response.body = await res.text();
  } else if (res.body) {
    ctx.response.body = new Uint8Array(await res.arrayBuffer());
  }

  if (!res.ok) ctx.response.setError();
};

export const fetcher = async (ctx) => {
  const { request, response } = ctx;

  const options = {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      ...Object.fromEntries(request.headers),
    },
    credentials: request.options.credentials,
    signal: request.signal,
  };

  if (request.method !== "GET" && request.body !== undefined) {
    const streaming = request.body instanceof ReadableStream;
    options.body = streaming ? request.body : JSON.stringify(request.body);
    if (streaming) {
      options.duplex = "half";
      options.headers["Content-Type"] = "text/event-stream";
    }
  }

  try {
    const res = await fetch(request.url.absolute, options);

    response.status = res.status;

    res.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/event-stream")) {
      response.body = res.body;
    } else {
      response.body = contentType.includes("application/json")
        ? await res.json()
        : await res.text();
    }

    if (!res.ok) {
      response.setError(ConnectionError.fromStatus(res.status, response));
    }
  } catch (error) {
    response.status = 0;
    response.error = ConnectionError.fromFetch(error, request);
    response.body = { request, error };
    // console.error(error);
    // console.trace(error);
    // console.log(request);
  }
};
// import { Response } from "@vivalence/typology";

// // should use response object explicitly.
// export const fetcher = async (ctx) => {
//   const { request } = ctx;

//   const options = {
//     method: request.method,
//     headers: {
//       "Content-Type": "application/json",
//       ...request.headers,
//     },
//     credentials: "include",
//   };

//   if (request._signal) {
//     options.signal = request._signal;
//   }

//   if (request.method !== "GET" && request.body !== undefined) {
//     options.body = JSON.stringify(request.body);
//   }

//   console.log("REQUEST", request.url.absolute, options);
//   let response;
//   try {
//     response = await fetch(request.url.absolute, options);
//   } catch (error) {
//     console.log("ERROR", request.url.absolute, error);
//     console.error(error, JSON.stringify({ error }));
//   }
//   console.log("RESPONSE", request.url.absolute, response);

//   const headers = {};
//   response.headers.forEach((value, key) => {
//     headers[key] = value;
//   });

//   let body;
//   const contentType = response.headers.get("content-type") || "";
//   if (contentType.includes("application/json")) {
//     body = await response.json();
//   } else {
//     body = await response.text();
//   }

//   ctx.response.status = response.status;
//   ctx.response.headers = new Map(Object.entries(headers));
//   ctx.response.body = body;
// };
