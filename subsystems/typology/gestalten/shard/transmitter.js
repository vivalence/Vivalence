import { atom } from "nanostores";
import { ConnectionError, Response, Socket, Url, Vector } from "@vivalence/typology";

// used in connections

// multiplex — base transport. One WebSocket per origin, lazily established and
// reused; every exchange rides a frame over that shared socket. Class-free: the
// keeper is closed-over state. Compose under retry() exactly like fetcher.
export function multiplex({ authority, mount = "/multiplex", vector, connect } = {}) {
  // span = new Span('multiplex')
  const open = connect ?? ((address) => new WebSocket(address));
  const pools = new Map(); // origin → { socket, opening, $state }

  const keeper = (origin) => {
    let keep = pools.get(origin);
    if (!keep) pools.set(origin, (keep = { socket: null, opening: null, $state: atom("IDLE") }));
    return keep;
  };

  async function establish(origin) {
    const keep = keeper(origin);
    if (keep.socket && keep.socket.ws.readyState === 1) return keep.socket;
    if (!keep.opening) {
      keep.$state.set("CONNECTING");
      keep.opening = new Promise((resolve, reject) => {
        const token = authority?.get()?.access;
        const base = new Url(origin).branch(mount);
        const armed = token ? base.with({ token }) : base;
        const address = armed.scheme(armed.secure ? "wss" : "ws").absolute;
        const socket = new Socket(open(address), vector ?? new Vector());
        //@beef  vector = new Vector(().use(this.span.trace *shard).slurp(vector)
        socket.ws.addEventListener(
          "open",
          () => {
            keep.socket = socket;
            keep.opening = null;
            keep.$state.set("CONNECTED");
            resolve(socket);
          },
          { once: true },
        );
        socket.ws.addEventListener(
          "error",
          () => {
            keep.opening = null;
            keep.$state.set("ERROR");
            reject(ConnectionError.network(`multiplex refused ${origin}`));
          },
          { once: true },
        );
        socket.ws.addEventListener("close", () => {
          if (keep.socket === socket) keep.socket = null;
          keep.opening = null;
          keep.$state.set("CLOSED");
          reject(ConnectionError.network(`multiplex closed ${origin}`));
        });
      });
    }
    return keep.opening;
  }

  const transport = async (ctx) => {
    const { request, response } = ctx;
    try {
      const socket = await establish(request.url.origin);
      const streaming = request.body instanceof ReadableStream;

      const frame = await socket.open(request.url, {
        query: request.url.search || undefined,
        input: streaming ? undefined : request.body,
        verb: request.method,
        token: authority?.get()?.access,
        stream: streaming || undefined,
      });

      const abort = () => socket.shut(frame);
      request.signal.addEventListener("abort", abort, { once: true });
      if (streaming) socket.feed(frame, request.body);

      if (request.headers.get("accept") === "text/event-stream") {
        response.status = 200;
        response.body = follow(socket, frame, request, abort);
        return;
      }

      try {
        for await (const output of socket.flow(frame)) {
          response.status = 200;
          response.body = output;
          return;
        }
        if (request.signal.aborted) {
          response.status = 0;
          response.error = ConnectionError.timeout("Request aborted", { request });
          response.body = { request };
          return;
        }
        response.status = 200;
        response.body = null;
      } finally {
        request.signal.removeEventListener("abort", abort);
        socket.forget(frame);
      }
    } catch (error) {
      if (request.signal.aborted) {
        response.status = 0;
        response.error = ConnectionError.timeout("Request aborted", { request });
      } else {
        response.status = error?.status ?? 0;
        response.error =
          error instanceof ConnectionError
            ? error
            : ConnectionError.network(`multiplex failed ${request.url.absolute}`, {
                request,
                error,
              });
      }
      response.body = { request, error };
    }
  };

  transport.close = () => {
    for (const keep of pools.values()) keep.socket?.close();
    pools.clear();
  };
  transport.$state = (origin) => keeper(origin).$state;
  return transport;
}

function follow(socket, frame, request, abort) {
  let settled = false;
  const conclude = () => {
    if (settled) return;
    settled = true;
    request.signal.removeEventListener("abort", abort);
    socket.forget(frame);
  };

  const body = (async function* () {
    let confirmed = false;
    try {
      for await (const output of socket.flow(frame, {
        arrived: () => {
          confirmed = true;
          body.onArrival?.();
        },
      })) {
        if (!confirmed) {
          confirmed = true;
          body.onArrival?.();
        }
        yield output;
      }
    } finally {
      if (!frame.closed) socket.shut(frame);
      conclude();
    }
  })();

  body.onArrival = null;
  return body;
}

// transport combinator — wraps a transport with retry policy. Lives at the effect
// boundary because compose's dispatch guard forbids re-entering next(); the wrapper
// owns the inner call, so attempts loop freely without touching the onion.
export const retry = (transport, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (ctx) => ctx.response.error?.isRetryable,
  } = options;
  const wrapped = async (ctx) => {
    for (let attempt = 0; ; attempt++) {
      ctx.request._attempt = attempt;
      await transport(ctx);
      if (!ctx.response.error || attempt >= maxRetries || !shouldRetry(ctx)) return;
      console.log(
        `[probe] retry ${attempt + 1}/${maxRetries} ${ctx.request.url.pathname} after ${ctx.response.error.type}`,
      );
      ctx.response = new Response();
      ctx.request._controller = null;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(baseDelay * 2 ** attempt + Math.random() * 500, maxDelay)),
      );
    }
  };
  return wrapped;
};

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
  } else if (contentType.includes("event-stream")) {
    ctx.response.body = res.body;
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
    console.warn(`[probe] fetch failed ${request.url.absolute}`, error);
    response.status = 0;
    response.error = ConnectionError.fromFetch(error, request);
    response.body = { request, error };
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
