import { assertEquals } from "@std/assert";
import { init, move, seek, slice, value } from "../state/search.js";

const rows = [
  { owner: "@viva", type: "instance", slug: "localhost" },
  { owner: "@viva", type: "instance", slug: "multiplayer" },
  { owner: "@localhost", type: "instance", slug: "standalone" },
  { owner: "@education", type: "game", slug: "dojo" },
  { owner: "@education", type: "game", slug: "riddler" },
];

const keys = ["owner", "type", "slug"];
const facets = ["owner", "type"];
const slugs = (state) => state.matches.map((at) => state.rows[at].slug);

Deno.test("search: bare query matches every row", () => {
  const state = init({ rows, keys, facets });
  assertEquals(state.matches.length, rows.length);
  assertEquals(slugs(seek(state, "")), slugs(state));
});

Deno.test("search: a plain term is a case-insensitive substring over the declared keys", () => {
  const state = seek(init({ rows, keys, facets }), "RIDD");
  assertEquals(slugs(state), ["riddler"]);
  assertEquals(slugs(seek(init({ rows, keys, facets }), "@education")), ["dojo", "riddler"]);
});

Deno.test("search: space-separated terms are ANDed", () => {
  const state = seek(init({ rows, keys, facets }), "viva multi");
  assertEquals(slugs(state), ["multiplayer"]);
});

Deno.test("search: a declared facet narrows one field only", () => {
  const state = seek(init({ rows, keys, facets }), "owner:@localhost");
  assertEquals(slugs(state), ["standalone"]);
  // slug is NOT declared a facet — the token stays literal, matching nothing
  assertEquals(slugs(seek(init({ rows, keys, facets }), "slug:dojo")), []);
});

Deno.test("search: an empty facet value matches every row carrying the field", () => {
  const state = seek(init({ rows, keys, facets }), "type:");
  assertEquals(state.matches.length, rows.length);
});

Deno.test("search: incremental narrowing agrees with a cold rescan", () => {
  const cold = (text) => slugs(seek(init({ rows, keys, facets }), text));
  let warm = init({ rows, keys, facets });
  // "owner" is a plain term matching nothing; "owner:" flips it to a facet matching all.
  // a naive startsWith-only guard would keep the empty set and never recover.
  for (const text of ["o", "ow", "owner", "owner:", "owner:@e", "owner:@e do"]) {
    warm = seek(warm, text);
    assertEquals(slugs(warm), cold(text), text);
  }
});

Deno.test("search: deleting characters rescans instead of staying narrowed", () => {
  let state = seek(init({ rows, keys, facets }), "@viva multi");
  assertEquals(slugs(state), ["multiplayer"]);
  state = seek(state, "@viva");
  assertEquals(slugs(state), ["localhost", "multiplayer"]);
});

Deno.test("search: seek resets the cursor, move clamps to the match count", () => {
  let state = move(init({ rows, keys, facets }), 3);
  assertEquals(state.index, 3);
  state = seek(state, "game");
  assertEquals(state.index, 0);
  state = move(state, 9);
  assertEquals(state.index, 1);
  assertEquals(value(state).slug, "riddler");
  assertEquals(move(state, -9).index, 0);
});

Deno.test("search: value is null when nothing matches", () => {
  assertEquals(value(seek(init({ rows, keys, facets }), "nothing")), null);
});

Deno.test("search: keys default to the fields of the first row", () => {
  const state = seek(init({ rows }), "dojo");
  assertEquals(slugs(state), ["dojo"]);
});

Deno.test("search: slice windows the match set around the cursor", () => {
  let state = init({ rows, keys, facets });
  assertEquals(slice(state, 2), { start: 0, rows: [rows[0], rows[1]] });
  state = move(state, 4);
  assertEquals(slice(state, 2), { start: 3, rows: [rows[3], rows[4]] });
  assertEquals(slice(state, 99).rows.length, rows.length);
});
