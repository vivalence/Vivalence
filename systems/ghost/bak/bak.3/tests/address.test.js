// systems/ghost/tests/address.test.js — standalone: address prefix · payload tail, resolved by longest-prefix match
//
//   deno test -A --no-check systems/ghost/tests/address.test.js
//   deno run  -A            systems/ghost/tests/address.test.js language othermode some other yap
//   deno run  -A            systems/ghost/tests/address.test.js fl -- quiz me --fast
//
// resolve(routes, argv) → Resolution
//   routes      :: { natures: string[], home: string }           every openable nature as "a/b/c", the default route
//   argv        :: string[]                                       the shell's words after `viva`
//   Resolution  :: { route, address, receiver, payload, flags, candidates, envelope }
//     route      ∈ "exact" | "prefix" | "default" | "ambiguous" | "none"
//     address    :: string[]        the matched segments (LPM)
//     receiver   :: string | null   address joined, or routes.home on the default route
//     payload    :: string          the remainder, verbatim, operands only
//     flags      :: {k: v|true}     POSIX-style, parsed until `--`
//     candidates :: string[]        natures a prefix-of-a-segment points at (ambiguous)
//     envelope   :: { performative, receiver, content }           FIPA-ACL view of the same thing

import { assertEquals } from "@std/assert";

const node = () => ({ edges: new Map(), open: false });

export function trie(natures) {
  const root = node();
  for (const nature of natures) {
    let position = root;
    for (const segment of nature.split("/").filter(Boolean)) {
      if (!position.edges.has(segment)) position.edges.set(segment, node());
      position = position.edges.get(segment);
    }
    position.open = true;
  }
  return root;
}

// POSIX guideline 10: options parse until `--`; everything after is operands.
export function posix(argv) {
  const operands = [];
  const flags = {};
  let terminated = false;
  for (const token of argv) {
    if (terminated || !token.startsWith("-") || token === "-") { operands.push(token); continue; }
    if (token === "--") { terminated = true; continue; }
    const body = token.replace(/^--?/, "");
    const at = body.indexOf("=");
    if (at > 0) flags[body.slice(0, at)] = body.slice(at + 1);
    else flags[body] = true;
  }
  return { operands, flags };
}

// Alexa's vocative sugar: `ask <name> to <utterance>` → `<name> <utterance>`
export function vocative(operands) {
  if (operands[0] === "ask") {
    const to = operands.indexOf("to");
    if (to > 1) return [...operands.slice(1, to), ...operands.slice(to + 1)];
  }
  return operands;
}

// IP-style LPM: descend while a segment is an edge; a segment that is a PREFIX of exactly one edge descends too.
export function lpm(root, operands) {
  let position = root;
  const address = [];
  let candidates = [];
  let at = 0;
  for (; at < operands.length; at++) {
    const word = operands[at];
    if (position.edges.has(word)) { position = position.edges.get(word); address.push(word); continue; }
    const near = [...position.edges.keys()].filter((edge) => edge.startsWith(word));
    if (near.length === 1) { position = position.edges.get(near[0]); address.push(near[0]); continue; }
    if (near.length > 1 && address.length === 0) candidates = near;
    break;
  }
  return { position, address, rest: operands.slice(at), candidates };
}

export function resolve(routes, argv) {
  const { operands, flags } = posix(argv);
  const words = vocative(operands).flatMap((word) => word.split("/").filter(Boolean));
  const { position, address, rest, candidates } = lpm(trie(routes.natures), words);
  const payload = rest.join(" ");

  let route;
  if (candidates.length) route = "ambiguous";
  else if (address.length && position.open && rest.length === 0) route = "exact";
  else if (address.length && position.open) route = "prefix";
  else if (address.length) route = "none";
  else route = payload ? "default" : "none";

  const receiver = route === "default" ? routes.home : route === "none" || route === "ambiguous" ? null : address.join("/");
  const performative = payload ? "turn" : route === "exact" ? "invoke" : "ask";
  return {
    route,
    address,
    receiver,
    payload,
    flags,
    candidates,
    envelope: { performative, receiver, content: payload || null },
  };
}

// ── the cases ────────────────────────────────────────────────────────────────────────────────────────────────────

const ROUTES = {
  natures: ["instance/use", "instance/up", "language/othermode", "language/dojo", "flashcards", "flashlight", "home"],
  home: "home",
};

const CASES = [
  ["command, exact", "instance use italian", { route: "prefix", receiver: "instance/use", payload: "italian" }],
  ["command, slash form", "instance/use italian", { route: "prefix", receiver: "instance/use", payload: "italian" }],
  ["reference, bare", "flashcards", { route: "exact", receiver: "flashcards", payload: "", envelope: { performative: "invoke" } }],
  ["reference + yap = a turn for the mode", "flashcards quiz me on verbs", { route: "prefix", receiver: "flashcards", payload: "quiz me on verbs" }],
  ["LPM: deeper address wins", "language othermode some other yap", { route: "prefix", receiver: "language/othermode", payload: "some other yap" }],
  ["LPM: daemon alone is not open → none", "language whatever", { route: "none", receiver: null, payload: "whatever" }],
  ["default route: no edge → home gets the yap", "what did i get wrong yesterday", { route: "default", receiver: "home", payload: "what did i get wrong yesterday" }],
  ["prefix of ONE edge descends", "flashc teach me", { route: "prefix", receiver: "flashcards", payload: "teach me" }],
  ["prefix of TWO edges → ambiguous, candidates named", "fl teach me", { route: "ambiguous", receiver: null, candidates: ["flashcards", "flashlight"] }],
  ["POSIX: -- ends the address, the rest is payload even if it looks like a nature", "home -- instance use", { route: "prefix", receiver: "home", payload: "instance use" }],
  ["POSIX: flags parse until --, operands keep their dashes after", "flashcards --fast -n=3 -- --not-a-flag", { receiver: "flashcards", flags: { fast: true, n: "3" }, payload: "--not-a-flag" }],
  ["vocative: ask <name> to <utterance>", "ask flashcards to quiz me", { receiver: "flashcards", payload: "quiz me" }],
  ["ACL envelope: a turn", "language dojo play", { envelope: { performative: "turn", receiver: "language/dojo", content: "play" } }],
  ["empty argv → none", "", { route: "none", receiver: null, payload: "" }],
];

const nested = (shape) => shape !== null && typeof shape === "object" && !Array.isArray(shape);
const pick = (held, shape) => Object.fromEntries(Object.keys(shape).map((key) => [key, nested(shape[key]) ? pick(held?.[key] ?? {}, shape[key]) : held?.[key]]));

for (const [name, line, expected] of CASES) {
  Deno.test(`address: ${name}  ⟨viva ${line}⟩`, () => {
    const held = resolve(ROUTES, line.split(" ").filter(Boolean));
    assertEquals(pick(held, expected), expected);
  });
}

if (import.meta.main) {
  const held = resolve(ROUTES, Deno.args);
  console.log(`viva ${Deno.args.join(" ")}`);
  console.log(JSON.stringify(held, null, 2));
}
