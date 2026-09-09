import { guard } from "./guard.js";
import { LIMITS } from "./limits.js";

export { LIMITS };

// manual redirects: a guard that runs on response.url has already let the request out.
// fetch is injected so the walk tests without a network.
export const hop = async (url, { fetch: get = fetch, resolve } = {}) => {
  let target = await guard(url, resolve);
  for (let step = 0; step <= LIMITS.hops; step++) {
    const response = await get(target, {
      headers: { accept: "text/html,text/plain" },
      redirect: "manual",
      signal: AbortSignal.timeout(LIMITS.timeout),
    });
    const location = response.headers.get("location");

    if (response.status >= 300 && response.status < 400 && location) {
      // the body of a redirect is never read, and an unread body holds the connection.
      await response.body?.cancel().catch(() => {});
      target = await guard(new URL(location, target), resolve);
      continue;
    }

    const type = response.headers.get("content-type") ?? "";

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    if (!/text\/(html|plain)/.test(type)) {
      await response.body?.cancel().catch(() => {});
      throw new Error(
        `refused: ${type || "unknown content-type"} is not a page`,
      );
    }
    return { response, target };
  }
  throw new Error(`refused: more than ${LIMITS.hops} redirects`);
};

// the stream is readable ONCE, so what this returns is the only copy of the page there will be.
export const drink = async (response) => {
  if (!response.body) return { body: "", bytes: 0, capped: false };

  const reader = response.body.getReader();
  // streaming decode holds an incomplete sequence back across a chunk boundary, so cutting at
  // LIMITS.bytes never lands mid-character — the trailing partial is dropped, not turned into
  // a replacement character.
  const decoder = new TextDecoder();
  let body = "";
  let bytes = 0;
  let capped = false;

  while (bytes < LIMITS.bytes) {
    const { done, value } = await reader.read();
    if (done) break;
    // a bound, not advice: one oversized chunk is cut HERE, not noticed afterwards.
    const room = LIMITS.bytes - bytes;
    const chunk = value.length > room
      ? (capped = true, value.subarray(0, room))
      : value;
    bytes += chunk.length;
    body += decoder.decode(chunk, { stream: true });
  }
  capped ||= bytes >= LIMITS.bytes;

  await reader.cancel().catch(() => {});
  return { body, bytes, capped };
};
