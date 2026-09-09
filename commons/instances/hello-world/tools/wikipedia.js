const ENDPOINT = "https://en.wikipedia.org/w/api.php";

// wikimedia asks every client to name itself — a bare fetch is throttled first when the
// shared pool runs hot. no contact address in it: the mode's manifest is the identity.
const AGENT = "vivalence-hello-world/0.0.1 (https://vivalence.org)";

// an external fetch inside a request handler needs a timeout SHORTER than the transport's:
// the multiplex gives up around 8s and hands the client an empty envelope with no status.
// bound it here so the caller gets a fault it can render instead of an aborted request.
export const TIMEOUT = 6000;

// one number, two doors — the armed tool's schema default and the aperture's fallback.
export const COUNT = 8;

// the API marks each hit inside the snippet with a span, and escapes the rest as html.
const ENTITIES = { "&quot;": '"', "&#039;": "'", "&amp;": "&", "&lt;": "<", "&gt;": ">" };
const plain = (snippet) =>
  snippet
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;|&#039;|&amp;|&lt;|&gt;/g, (entity) => ENTITIES[entity]);

// an article's address is its title, one path segment, spaces as underscores.
export const address = (title) =>
  `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;

export const query = async (terms, count, { fetch: get = fetch } = {}) => {
  const at = `${ENDPOINT}?${new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: terms,
    srlimit: String(count),
    srprop: "snippet",
    format: "json",
    formatversion: "2",
  })}`;
  let response;
  try {
    response = await get(at, {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { "User-Agent": AGENT },
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new Error(
        `wikipedia did not answer within ${TIMEOUT / 1000}s — try again`,
      );
    }
    throw new Error(`wikipedia unreachable — ${error.message}`);
  }
  if (!response.ok) {
    throw new Error(`wikipedia ${response.status} — try again`);
  }
  const { query: { search } } = await response.json();
  // the limit is the server's: srlimit caps the page, so nothing is sliced here.
  return search.map(({ title, snippet }) => ({
    title,
    url: address(title),
    snippet: plain(snippet),
  }));
};
