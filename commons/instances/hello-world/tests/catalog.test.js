import {
  fromm,
  shard,
  specimen,
  steer,
  ToolCall,
  Vector,
} from "@vivalence/typology";
import { GENERATIVE } from "@vivalence/runtime/daemon/traits";
import { generator, tools } from "../mode.viva.js";

// the mode's report() reads paladin directly, so the fake daemon supplies only what it walks;
// every assertion here is on KEYS, never on this machine's content.
const daemon = {
  mountpoint: null,
  entities: {},
  services: {},
  cortex: { faculties: new Map() },
  flatmodes: () => [],
};

// the same daemon with NO cortex at all — the shape that used to crash the fold.
const cortexless = { ...daemon, cortex: null };

// tooled.js:10 then harnessed.js — mode.tools, then the GENERATIVE trait's tools with the
// mode's generator slurped onto them. `tools` alone is a catalog the model never gets.
const generative = {
  manifest: { slug: "hello-world", type: "demo" },
  module: { generator },
};
await GENERATIVE(generative, {
  mountpoint: { absolute: "/nonexistent/catalog" },
});
const armed = new Vector().slurp(tools);
armed.branch("/generator").slurp(generative.generator.tools);
armed.use(shard.context.bind("daemon", daemon));

const names = () =>
  steer.trie.rollup(armed, () => null).map((entry) =>
    new ToolCall(entry.steps).name
  );
const nodes = () => steer.trie.rollup(armed, () => null);
const invoke = async (name, input) =>
  fromm.yield(
    await steer.dispatch.invoke(
      armed,
      new ToolCall(name).signal,
      steer.strategy.guarded,
    )(input),
  );

specimen.describe("hello-world tools — the catalog", () => {
  specimen.it("P-catalog: the armed catalog is exactly eight names", () => {
    specimen.expect(names()).toEqual([
      "viva_doctor",
      "web_search",
      "web_read",
      "research",
      "generator_view_render",
      "generator_view_revise",
      "generator_view_inspect",
      "generator_view_list",
    ]);
  });

  specimen.it(
    "P-catalog: the assembly contributes four; the generator rewords two and mints none",
    () => {
      const named = (vector) =>
        steer.trie.rollup(vector, () => null).map((entry) =>
          new ToolCall(entry.steps).name
        );
      specimen.expect(named(tools)).toEqual([
        "viva_doctor",
        "web_search",
        "web_read",
        "research",
      ]);
      // the generator arms NOTHING by itself: rollup lists callable nodes and it has none —
      // two rewords the trait's tools absorb, plus the refuse middleware. the four names
      // come from GENERATIVE.
      specimen.expect(named(generator)).toEqual([]);
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
    const [doctor, search, read, research, render, revise, inspect, list] =
      nodes();
    specimen.expect(doctor.pattern.valence).toContain("viva instance/doctor");
    specimen.expect(search.pattern.valence).toContain("Wikipedia");
    specimen.expect(read.pattern.valence).toContain("markdown");
    specimen.expect(research.pattern.valence).toContain(
      "one call per subject",
    );
    specimen.expect(render.pattern.valence).toContain("HOUSE RULES");
    specimen.expect(revise.pattern.valence).toContain("HOUSE RULES");
    specimen.expect(inspect.pattern.valence).toContain("by its hash");
    specimen.expect(list.pattern.valence).toContain("on this thread");
  });

  specimen.it(
    "P-noexternal: the refusal rides the trait's door as middleware — a URL import never reaches the bundler",
    async () => {
      const { condition, output } = await invoke("generator_view_render", {
        source: '<script>import x from "https://esm.sh/x";</script><p/>',
        label: { name: "external" },
      });
      specimen.expect(condition).toBe("ERROR");
      specimen.expect(output.message).toContain("may not import from a URL");
      specimen.expect(output.message).toContain("do not retry it unchanged");
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
    const [node] = nodes();
    specimen.expect(Object.keys(node.pattern.input.properties ?? {})).toEqual(
      [],
    );
  });

  specimen.it("P-fold: the three subjects come back together", async () => {
    const { output } = await invoke("viva_doctor", {});
    specimen.expect(Object.keys(output)).toEqual([
      "daemon",
      "ledger",
      "registry",
    ]);
  });

  specimen.it(
    "P-novalues: no environment entry carries anything but key and set",
    async () => {
      const { output } = await invoke("viva_doctor", {});
      for (const held of output.ledger.environment) {
        specimen.expect(Object.keys(held)).toEqual(["key", "set"]);
      }
    },
  );
});

specimen.describe("viva_doctor — a daemon with no cortex", () => {
  // tools/doctor.js read shape.cortex.strip(ctx.daemon.cortex ?? []) — and strip() reads
  // cortex.faculties, so the `?? []` fallback threw on the very case it was written for.
  // The fallback WAS the crash.
  specimen.it(
    "P-nocortex: the fold reports no faculties instead of throwing",
    async () => {
      const bare = new Vector().slurp(tools);
      bare.use(shard.context.bind("daemon", cortexless));
      const { output } = await steer.dispatch.invoke(
        bare,
        new ToolCall("viva_doctor").signal,
        steer.strategy.guarded,
      )({});
      specimen.expect(output.daemon.cortex).toEqual([]);
    },
  );
});

specimen.describe("web_search — the door, without the index", () => {
  specimen.it(
    "P-count: the count field defaults to 8 and caps at 100",
    () => {
      const [, search] = nodes();
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
      const [, search] = nodes();
      specimen.expect(search.pattern.input.required).toEqual(["query"]);
    },
  );

  specimen.it(
    "P-count: omitting count still arrives as 8 at the effect",
    () => {
      const [, search] = nodes();
      const input = { query: "deno permission flags" };
      search.pattern.input.cast(input);
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
  services: {
    reader: { open: (url) => (opened.push(url), Promise.resolve(PAGE)) },
  },
  cortex: {
    faculties: new Map(),
    hallucinate: {
      object: {
        render: (request) => {
          seenRequest = request;
          return Promise.resolve({
            output: {
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

const litArmed = new Vector().slurp(tools);
litArmed.use(shard.context.bind("daemon", lit));
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
      const { condition, output } = await litInvoke("web_read", {
        url: "https://docs.deno.test/permissions",
      });
      specimen.expect(condition).toBe(undefined);
      specimen.expect(opened).toEqual(["https://docs.deno.test/permissions"]);
      specimen.expect(output.markdown).toContain("secure by default");
      // the DOCUMENT's title, not the pick's — the model never saw any text to name it with.
      specimen.expect(output.title).toBe("Permissions | Deno Docs");
      specimen.expect(output.url).toBe("https://docs.deno.test/permissions");
      specimen.expect(output.matched).toBe(true);
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
      specimen.expect(seenRequest.policy.tune).toBe("frugal");
      specimen.expect(seenRequest.output.schema).toBeTruthy();
    },
  );

  specimen.it(
    "P-lit: a reader that throws is reported with the url, not swallowed",
    async () => {
      const angry = {
        ...lit,
        services: {
          reader: {
            open: () =>
              Promise.reject(new Error("refused: not a public address")),
          },
        },
      };
      const angryArmed = new Vector().slurp(tools);
      angryArmed.use(shard.context.bind("daemon", angry));
      const { condition, output } = await steer.dispatch.invoke(
        angryArmed,
        new ToolCall("web_read").signal,
        steer.strategy.guarded,
      )({ url: "http://127.0.0.1/" });
      specimen.expect(condition).toBe("ERROR");
      specimen.expect(output.message).toContain("not a public address");
      specimen.expect(output.message).toContain("http://127.0.0.1/");
    },
  );
});

// hello-world now consumes a reader, so this is no longer hello-world's own path — it is the
// path any OTHER daemon mounting this mode takes, and the recovery message still has to hold.
specimen.describe("web_read — dark on a daemon that consumes no reader", () => {
  specimen.it(
    "P-dark: with no reader service the node says so instead of throwing",
    async () => {
      const { condition, output } = await invoke("web_read", {
        url: "https://example.test/",
      });
      specimen.expect(condition).toBe("ERROR");
      specimen.expect(output.message).toContain("not available on this daemon");
      specimen.expect(output.message).toContain("Do not retry");
      specimen.expect(output.message).toContain("web_search snippets");
    },
  );
});
