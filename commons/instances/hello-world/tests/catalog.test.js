import { contexts, Controller, fromm, Path, shard, Span, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { traits } from "@vivalence/runtime";
const { SURFACING } = traits.mode;
import { tools } from "../mode.viva.js";
import { drawing } from "../page/index.js";

// the mode's report() reads paladin directly, so the fake daemon supplies only what it walks;
// every assertion here is on KEYS, never on this machine's content.
const daemon = {
  type: "daemon",
  mountpoint: null,
  entities: {},
  providers: {},
  cortex: { faculties: new Map() },
  reference: new Path("/daemon/hello"),
  modes: {},
};

// the same daemon with NO cortex at all — the shape that used to crash the fold.
const cortexless = { ...daemon, cortex: null };

// generative.js then tooling.js, in manifest order — both graft onto mode.tools, the one
// catalog harnessed.js arms. `tools` alone is a catalog the model never gets.
const surfacing = {
  manifest: { slug: "hello-world", type: "demo" },
  module: {},
  mountpoint: "/nonexistent/catalog",
  entity: { id: "mode-1" },
  tools: new Vector(),
};
await SURFACING(surfacing, { entities: {} });
const armed = surfacing.tools.graft(tools);
armed.use(shard.context.spread(contexts.daemonDie, daemon));

const names = () =>
  steer.trie.leaves(armed).map((entry) =>
    new ToolCall(entry.steps).name
  );
const nodes = () => steer.trie.leaves(armed);
const node = (name) => nodes().find((entry) => new ToolCall(entry.steps).name === name);
const invoke = async (name, input) =>
  fromm.yield(
    await steer.dispatch.invoke(
      armed,
      new ToolCall(name).signal,
      steer.strategy.guarded,
    )(input),
  );

specimen.describe("hello-world tools — the catalog", () => {
  specimen.it("P-catalog: the armed catalog is four of its own, eight imported from the runtime, five from SURFACING", () => {
    specimen.expect(names()).toEqual([
      "buffer_create",
      "buffer_update",
      "buffer_label",
      "surface_create",
      "surface_update",
      "surface_read",
      "surface_list",
      "viva_doctor",
      "web_search",
      "web_read",
      "research",
      "entity_schema",
      "entity_find",
      "entity_count",
      "entity_update",
      "thread_update",
      "mode_find",
    ]);
  });

  specimen.it(
    "P-catalog: the assembly contributes four and imports eight (m117: the root arms no domain tool); drawing rewords two and mints none",
    () => {
      const named = (vector) =>
        steer.trie.leaves(vector).map((entry) =>
          new ToolCall(entry.steps).name
        );
      specimen.expect(named(tools)).toEqual([
        "viva_doctor",
        "web_search",
        "web_read",
        "research",
        "entity_schema",
        "entity_find",
        "entity_count",
        "entity_update",
        "buffer_update",
        "buffer_label",
        "thread_update",
        "mode_find",
      ]);
      // drawing arms NOTHING by itself: it holds no effect — two rewords over the trait's
      // tools, plus the refuse middleware. the five names come from GENERATIVE.
      specimen.expect(named(drawing)).toEqual([]);
    },
  );

  specimen.it(
    "P-catalog: every node carries a valence and an input schema",
    () => {
      for (const node of nodes()) {
        specimen.expect(typeof node.pattern.valence).toBe("string");
        specimen.expect(node.pattern.valence.length > 80).toBe(true);
        specimen.expect(node.pattern.input.type).toBe("object");
      }
    },
  );

  specimen.it("P-provenance: the assembly slurps, it does not rewrite", () => {
    const byName = Object.fromEntries(nodes().map((node) => [new ToolCall(node.steps).name, node]));
    const { viva_doctor: doctor, web_search: search, web_read: read, research, buffer_create: open, surface_create: create, surface_update: update, surface_read: peek, surface_list: list } = byName;
    specimen.expect(doctor.pattern.valence).toContain("viva instance/doctor");
    specimen.expect(search.pattern.valence).toContain("Wikipedia");
    specimen.expect(read.pattern.valence).toContain("markdown");
    specimen.expect(research.pattern.valence).toContain(
      "one call per subject",
    );
    specimen.expect(open.pattern.valence).toContain("working area");
    specimen.expect(create.pattern.valence).toContain("HOUSE RULES");
    specimen.expect(update.pattern.valence).toContain("HOUSE RULES");
    specimen.expect(peek.pattern.valence).toContain("by slug");
    specimen.expect(list.pattern.valence).toContain("this mode holds");
  });

  specimen.it(
    "P-noexternal: the refusal rides the trait's door as middleware — a URL import never reaches the bundler",
    async () => {
      const { condition, product } = await invoke("surface_create", {
        slug: "external",
        mime: "application/vnd.viva.dom.svelte+javascript",
        source: '<script>import x from "https://esm.sh/x";</script><p/>',
      });
      specimen.expect(condition).toBe("ERROR");
      specimen.expect(product.message).toContain("may not import from a URL");
      specimen.expect(product.message).toContain("do not retry it unchanged");
    },
  );

  specimen.it(
    "P-provenance: the draw door never advertises the mint — the emitter is not a tool",
    () => {
      specimen.expect(names()).not.toContain("article");
      specimen.expect(names().some((name) => name.includes("emit"))).toBe(
        false,
      );
    },
  );
});

specimen.describe("viva_doctor — the whole record, no knobs", () => {
  specimen.it("P-noknobs: the schematic takes no input at all", () => {
    const doctor = node("viva_doctor");
    specimen.expect(Object.keys(doctor.pattern.input.properties ?? {})).toEqual(
      [],
    );
  });

  specimen.it("P-fold: the three subjects come back together", async () => {
    const { product } = await invoke("viva_doctor", {});
    specimen.expect(Object.keys(product)).toEqual([
      "daemon",
      "ledger",
      "registry",
    ]);
  });

  specimen.it(
    "P-novalues: no environment entry carries anything but key and set",
    async () => {
      const { product } = await invoke("viva_doctor", {});
      for (const held of product.ledger.environment) {
        specimen.expect(Object.keys(held)).toEqual(["key", "set"]);
      }
    },
  );
});

specimen.describe("viva_doctor — a daemon with no cortex", () => {
  // tools/doctor.js read shape.cortex.strip(ctx.cortex ?? []) — and strip() reads
  // cortex.faculties, so the `?? []` fallback threw on the very case it was written for.
  // The fallback WAS the crash.
  specimen.it(
    "P-nocortex: the fold reports no faculties instead of throwing",
    async () => {
      const bare = new Vector().graft(tools);
      bare.use(shard.context.spread(contexts.daemonDie, cortexless));
      const { product } = await steer.dispatch.invoke(
        bare,
        new ToolCall("viva_doctor").signal,
        steer.strategy.guarded,
      )({});
      specimen.expect(product.daemon.cortex).toEqual([]);
    },
  );
});

specimen.describe("web_search — the door, without the index", () => {
  specimen.it(
    "P-count: the count field defaults to 8 and caps at 100",
    () => {
      const search = node("web_search");
      const { count } = search.pattern.input.properties;
      specimen.expect(count.default).toBe(8);
      specimen.expect(count.maximum).toBe(100);
      specimen.expect(count.minimum).toBe(1);
    },
  );

  // a defaulted field in `required` tells the model it MUST pass a number it has no opinion
  // about. .optional() takes it out of `required` and the default still fills on cast —
  // guarded (steer/strategy.js) calls step.input.cast(input) BEFORE it validates.
  specimen.it(
    "P-count: query is required and count is NOT — a default is not a demand",
    () => {
      const search = node("web_search");
      specimen.expect(search.pattern.input.required).toEqual(["query"]);
    },
  );

  specimen.it(
    "P-count: omitting count still arrives as 8 at the effect",
    () => {
      const search = node("web_search");
      const input = search.pattern.input.cast({ query: "deno permission flags" });
      specimen.expect(input.count).toBe(8);
      specimen.expect([...search.pattern.input.errors(input)].length).toBe(0);
    },
  );
});

// the daemon the switch created: a reader consumed, and a cortex that answers the pick. both
// are stubs — this asserts the WIRING, not wikipedia and not a model.
const PAGE = {
  url: "https://docs.deno.test/permissions",
  title: "Permissions | Deno Docs",
  skeleton: "main#content.prose chars=1548 p=7",
  extract: (selector) => ({
    markdown: selector === "main#content"
      ? "# Permissions\n\nsecure by default"
      : "fallback",
    chars: selector === "main#content" ? 34 : 8,
    truncated: false,
    links: [{ text: "security", href: "https://docs.deno.test/security" }],
    selector,
    matched: selector === "main#content",
  }),
};

const opened = [];
const lit = {
  ...daemon,
  providers: {
    reader: { open: (url) => (opened.push(url), Promise.resolve(PAGE)) },
  },
  cortex: {
    faculties: new Map(),
    hallucinate: {
      object: {
        render: (request) => {
          seenRequest = request;
          return Promise.resolve({
            product: {
              // no title — the Pick has none. the skeleton carries no text to name a page with.
              object: { selector: "main#content", reason: "7 paragraphs" },
            },
          });
        },
      },
    },
  },
};
let seenRequest = null;

const litArmed = new Vector().graft(tools);
litArmed.use(shard.context.spread(contexts.daemonDie, lit));
litArmed.use(shard.context.bind("controller", new Controller({ stdout: new Span("hallucination") })));
const litInvoke = (name, input) =>
  steer.dispatch.invoke(
    litArmed,
    new ToolCall(name).signal,
    steer.strategy.guarded,
  )(input);

specimen.describe("web_read — lit, once a reader is consumed", () => {
  specimen.it(
    "P-lit: the reader is opened with the model's url and the article comes back",
    async () => {
      opened.length = 0;
      const { condition, product } = await litInvoke("web_read", {
        url: "https://docs.deno.test/permissions",
      });
      specimen.expect(condition).toBe(undefined);
      specimen.expect(opened).toEqual(["https://docs.deno.test/permissions"]);
      specimen.expect(product.markdown).toContain("secure by default");
      // the DOCUMENT's title, not the pick's — the model never saw any text to name it with.
      specimen.expect(product.title).toBe("Permissions | Deno Docs");
      specimen.expect(product.url).toBe("https://docs.deno.test/permissions");
      specimen.expect(product.matched).toBe(true);
    },
  );

  specimen.it(
    "P-lit: the SKELETON is what reaches the model, never the page body",
    async () => {
      await litInvoke("web_read", {
        url: "https://docs.deno.test/permissions",
      });
      const text = seenRequest.turns[0].parts[0].text;
      specimen.expect(text).toBe(PAGE.skeleton);
      specimen.expect(seenRequest.policy.tier).toBe("frugal");
      specimen.expect(seenRequest.output.schema).toBeTruthy();
    },
  );

  specimen.it(
    "P-lit: a reader that throws is reported with the url, not swallowed",
    async () => {
      const angry = {
        ...lit,
        providers: {
          reader: {
            open: () =>
              Promise.reject(new Error("refused: not a public address")),
          },
        },
      };
      const angryArmed = new Vector().graft(tools);
      angryArmed.use(shard.context.spread(contexts.daemonDie, angry));
      const { condition, product } = await steer.dispatch.invoke(
        angryArmed,
        new ToolCall("web_read").signal,
        steer.strategy.guarded,
      )({ url: "http://127.0.0.1/" });
      specimen.expect(condition).toBe("ERROR");
      specimen.expect(product.message).toContain("not a public address");
      specimen.expect(product.message).toContain("http://127.0.0.1/");
    },
  );
});

// hello-world now consumes a reader, so this is no longer hello-world's own path — it is the
// path any OTHER daemon mounting this mode takes, and the recovery message still has to hold.
specimen.describe("web_read — dark on a daemon that consumes no reader", () => {
  specimen.it(
    "P-dark: with no reader service the node says so instead of throwing",
    async () => {
      const { condition, product } = await invoke("web_read", {
        url: "https://example.test/",
      });
      specimen.expect(condition).toBe("ERROR");
      specimen.expect(product.message).toContain("not available on this daemon");
      specimen.expect(product.message).toContain("Do not retry");
      specimen.expect(product.message).toContain("web_search snippets");
    },
  );
});
