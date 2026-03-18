# HTTP Compiler + Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Context prototype (typology) and an http compiler (vector) that compiles a Vector into a native `(Request) => Response` handler, replacing Oak.

**Architecture:** Context is a passive container in typology with getter/setter aliases (`input` ↔ `request.body`, `output` ↔ `response.body`). The http compiler calls `traverse` from vector/controller, aggregates params from steps, runs carry middleware with a terminal that does arity dispatch (0/1/2 args), and serializes the response via a `respond` function that branches on body type (JSON/binary/stream).

**Tech Stack:** Deno, `@vivalence/typology` (Request, Response, Signal), `@vivalence/vector` (Vector, traverse, NotFound), specimen (BDD test framework)

**Spec:** `subsystems/vector/.ikiro/http-compiler.workpackage.org`

---

### Task 1: Context Prototype — Test

**Files:**
- Create: `subsystems/typology/tests/context.test.js`

- [ ] **Step 1: Write Context test**

```js
import { specimen, Request, Response, Url } from "@vivalence/typology";

specimen.describe("Context", () => {
  specimen.describe("construction", () => {
    specimen.it("from plain object", async () => {
      const { Context } = await import("@vivalence/typology");
      const ctx = new Context({ body: { x: 1 }, url: "http://localhost/test", method: "POST" });
      specimen.expect(ctx.request).toBeInstanceOf(Request);
      specimen.expect(ctx.response).toBeInstanceOf(Response);
      specimen.expect(ctx.state).toEqual({});
      specimen.expect(ctx.params).toEqual({});
    });

    specimen.it("from Request instance", async () => {
      const { Context } = await import("@vivalence/typology");
      const req = new Request({ body: { x: 1 }, url: "http://localhost/test" });
      const ctx = new Context(req);
      specimen.expect(ctx.request).toBe(req);
    });
  });

  specimen.describe("input alias", () => {
    specimen.it("reads from request.body", async () => {
      const { Context } = await import("@vivalence/typology");
      const ctx = new Context({ body: { n: 42 }, url: "http://x" });
      specimen.expect(ctx.input).toEqual({ n: 42 });
    });

    specimen.it("writes to request.body", async () => {
      const { Context } = await import("@vivalence/typology");
      const ctx = new Context({ body: {}, url: "http://x" });
      ctx.input = { replaced: true };
      specimen.expect(ctx.request.body).toEqual({ replaced: true });
    });

    specimen.it("mutation visible on both sides", async () => {
      const { Context } = await import("@vivalence/typology");
      const ctx = new Context({ body: { a: 1 }, url: "http://x" });
      ctx.input.b = 2;
      specimen.expect(ctx.request.body.b).toBe(2);
    });
  });

  specimen.describe("output alias", () => {
    specimen.it("reads from response.body", async () => {
      const { Context } = await import("@vivalence/typology");
      const ctx = new Context({ url: "http://x" });
      ctx.response.body = { result: true };
      specimen.expect(ctx.output).toEqual({ result: true });
    });

    specimen.it("writes to response.body", async () => {
      const { Context } = await import("@vivalence/typology");
      const ctx = new Context({ url: "http://x" });
      ctx.output = "hello";
      specimen.expect(ctx.response.body).toBe("hello");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd subsystems/typology && deno test -A --no-check tests/context.test.js`
Expected: FAIL — Context not exported from typology

---

### Task 2: Context Prototype — Implementation

**Files:**
- Create: `subsystems/typology/prototypes/context.js`
- Modify: `subsystems/typology/prototypes/index.ts` — add export
- Modify: `subsystems/typology/deno.jsonc` — add test task

- [ ] **Step 1: Create Context prototype**

Create `subsystems/typology/prototypes/context.js`:

```js
import { Request } from "./request.js";
import { Response } from "./response.js";

export class Context {
  constructor(request) {
    this.request = request instanceof Request ? request : new Request(request);
    this.response = new Response();
    this.state = {};
    this.params = {};
  }

  get input() { return this.request.body; }
  set input(v) { this.request.body = v; }

  get output() { return this.response.body; }
  set output(v) { this.response.body = v; }
}
```

- [ ] **Step 2: Export from typology**

Add to `subsystems/typology/prototypes/index.ts`:

```ts
export * from "./context.js";
```

- [ ] **Step 3: Add test task to deno.jsonc**

Add to `subsystems/typology/deno.jsonc` tasks:

```json
"test/context": "deno test -A --no-check --watch tests/context.test.js"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd subsystems/typology && deno test -A --no-check tests/context.test.js`
Expected: PASS — all Context tests green

- [ ] **Step 5: Commit**

---

### Task 3: Response.type Property

**Files:**
- Modify: `subsystems/typology/prototypes/response.js`

- [ ] **Step 1: Add type property to Response constructor**

In `subsystems/typology/prototypes/response.js`, add `this.type` to the constructor:

```js
constructor(response = {}) {
    this.status = response.status ?? 0;
    this.headers = new Map(Object.entries(response.headers || {}));
    this.body = response.body ?? null;
    this.error = response.error ?? null;
    this.type = response.type ?? null;
}
```

- [ ] **Step 2: Verify existing Response tests still pass**

Run: `cd subsystems/typology && deno test -A --no-check tests/connection.test.js`
Expected: PASS — Response.type is additive, no breakage

- [ ] **Step 3: Commit**

---

### Task 4: HTTP Compiler — Scenario 1 (Simple Routes)

**Files:**
- Create: `subsystems/vector/tests/compiler/http.test.js`
- Create: `subsystems/vector/compiler/http.js`

- [ ] **Step 1: Write failing test for simple routes**

Create `subsystems/vector/tests/compiler/http.test.js`:

```js
import { specimen } from "@vivalence/typology";
import { Vector } from "@vivalence/vector";
import { http } from "../../compiler/http.js";

specimen.describe("http compiler", () => {
  specimen.describe("simple routes", () => {
    const vector = new Vector();
    vector.open("ping", () => "pong");
    vector.open("zero", () => 42);
    vector.open("echo", (input, ctx) => ({ input }));

    const handler = http(vector);

    specimen.it("arity 0 — returns value as JSON", async () => {
      const res = await handler(new Request("http://localhost/ping"));
      specimen.expect(res.status).toBe(200);
      specimen.expect(await res.json()).toBe("pong");
    });

    specimen.it("arity 0 — number", async () => {
      const res = await handler(new Request("http://localhost/zero"));
      specimen.expect(await res.json()).toBe(42);
    });

    specimen.it("arity 2 — receives parsed body", async () => {
      const res = await handler(new Request("http://localhost/echo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hello: "world" }),
      }));
      const body = await res.json();
      specimen.expect(body.input.hello).toBe("world");
    });

    specimen.it("404 on unmatched route", async () => {
      const res = await handler(new Request("http://localhost/nonexistent"));
      specimen.expect(res.status).toBe(404);
    });

    specimen.it("default content-type is application/json", async () => {
      const res = await handler(new Request("http://localhost/ping"));
      specimen.expect(res.headers.get("content-type")).toBe("application/json");
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd subsystems/vector && deno test -A --no-check tests/compiler/http.test.js`
Expected: FAIL — http.js doesn't exist

- [ ] **Step 3: Implement http compiler**

Create `subsystems/vector/compiler/http.js`:

```js
import { Signal, Context } from "@vivalence/typology";
import { traverse } from "../controller/traverse.js";
import { NotFound } from "../prototypes/errors.js";

export function http(vector) {
  return async (req) => {
    const body = await req.json().catch(() => null);
    const ctx = new Context({
      body,
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers),
    });

    try {
      const signal = new Signal(ctx.request.url.pathname);
      const [effect, carry, steps] = traverse(vector, signal);
      if (!effect) return respond(ctx, 404);

      ctx.params = Object.assign(
        {}, ...steps.map(s => s.parameters).filter(Boolean)
      );

      await carry(ctx, async (c) => {
        if (effect.length === 0) c.output = await effect();
        else if (effect.length === 1) c.output = await effect(c);
        else if (effect.length === 2) c.output = await effect(c.input, c);
      });
    } catch (e) {
      if (e.code === "NOT_FOUND") return respond(ctx, 404);
      console.error(e);
      return respond(ctx, 500);
    }

    return respond(ctx);
  };
}

function respond(ctx, status) {
  const body = ctx.response.body;
  const s = status || ctx.response.status || (body != null ? 200 : 404);
  const type = ctx.response.type || "application/json";

  if (body instanceof Uint8Array || body instanceof ReadableStream) {
    return new Response(body, { status: s, headers: { "content-type": type } });
  }

  return new Response(
    body != null ? JSON.stringify(body) : null,
    { status: s, headers: { "content-type": type } },
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd subsystems/vector && deno test -A --no-check tests/compiler/http.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

---

### Task 5: HTTP Compiler — Scenario 2 (Middleware + Params + Branches)

**Files:**
- Modify: `subsystems/vector/tests/compiler/http.test.js`

- [ ] **Step 1: Add middleware + params + branches tests**

Append to the test file inside the outer `specimen.describe`:

```js
  specimen.describe("middleware + params + branches", () => {
    const vector = new Vector();

    vector.use(async (ctx, next) => {
      ctx.state = ctx.state || {};
      ctx.state.root = true;
      await next();
    });

    vector.open("users/:id", (ctx) => ({
      id: ctx.params.id,
      root: ctx.state.root,
    }));

    const api = vector.branch("api");
    api.use(async (ctx, next) => {
      ctx.state.api = true;
      await next();
    });
    api.open("items", () => [1, 2, 3]);
    api.open("items/:itemId", (ctx) => ({
      itemId: ctx.params.itemId,
      api: ctx.state.api,
      root: ctx.state.root,
    }));

    const handler = http(vector);

    specimen.it("params from :id pattern", async () => {
      const res = await handler(new Request("http://localhost/users/42"));
      const body = await res.json();
      specimen.expect(body.id).toBe("42");
      specimen.expect(body.root).toBe(true);
    });

    specimen.it("branch routes", async () => {
      const res = await handler(new Request("http://localhost/api/items"));
      specimen.expect(await res.json()).toEqual([1, 2, 3]);
    });

    specimen.it("branch middleware + params accumulate", async () => {
      const res = await handler(new Request("http://localhost/api/items/7"));
      const body = await res.json();
      specimen.expect(body.itemId).toBe("7");
      specimen.expect(body.api).toBe(true);
      specimen.expect(body.root).toBe(true);
    });
  });
```

- [ ] **Step 2: Run test to verify it passes**

Run: `cd subsystems/vector && deno test -A --no-check tests/compiler/http.test.js`
Expected: PASS — traverse already handles middleware accumulation and params

- [ ] **Step 3: Commit**

---

### Task 6: HTTP Compiler — Scenario 3 (Response Types)

**Files:**
- Modify: `subsystems/vector/tests/compiler/http.test.js`

- [ ] **Step 1: Add response type tests**

Append to the test file:

```js
  specimen.describe("response types", () => {
    const vector = new Vector();

    vector.open("json", () => ({ data: true }));

    vector.open("binary", (ctx) => {
      ctx.response.type = "audio/mpeg";
      return new Uint8Array([0x49, 0x44, 0x33]);
    });

    vector.open("text", (ctx) => {
      ctx.response.type = "text/plain";
      return "hello";
    });

    const handler = http(vector);

    specimen.it("JSON default", async () => {
      const res = await handler(new Request("http://localhost/json"));
      specimen.expect(res.headers.get("content-type")).toBe("application/json");
      specimen.expect(await res.json()).toEqual({ data: true });
    });

    specimen.it("binary with custom type", async () => {
      const res = await handler(new Request("http://localhost/binary"));
      specimen.expect(res.headers.get("content-type")).toBe("audio/mpeg");
      const buf = new Uint8Array(await res.arrayBuffer());
      specimen.expect(buf[0]).toBe(0x49);
    });

    specimen.it("text with custom type", async () => {
      const res = await handler(new Request("http://localhost/text"));
      specimen.expect(res.headers.get("content-type")).toBe("text/plain");
      specimen.expect(await res.text()).toBe("\"hello\"");
    });
  });
```

Note: text response goes through `JSON.stringify("hello")` → `"\"hello\""` since it's
not a Uint8Array or ReadableStream. If we want raw string passthrough, `respond` needs
a string branch. Check whether this matters — adjust `respond` if test fails on the text case.

- [ ] **Step 2: Run test — check if text case needs respond adjustment**

Run: `cd subsystems/vector && deno test -A --no-check tests/compiler/http.test.js`

If the text test fails because `JSON.stringify("hello")` produces `"hello"` (with quotes),
adjust the test expectation or add a string branch to `respond`:

```js
if (typeof body === "string") {
  return new Response(body, { status: s, headers: { "content-type": type } });
}
```

- [ ] **Step 3: Commit**

---

### Task 7: HTTP Compiler — Scenario 4 (Re-entrant Vector Call)

**Files:**
- Modify: `subsystems/vector/tests/compiler/http.test.js`

- [ ] **Step 1: Add re-entrant call test**

Append to the test file:

```js
  specimen.describe("re-entrant vector call", () => {
    const { Signal, Context } = await import("@vivalence/typology");
    const { traverse } = await import("../../controller/traverse.js");
    const { NotFound } = await import("../../prototypes/errors.js");

    const vector = new Vector();

    function withCall(vec) {
      return async (ctx, next) => {
        ctx.call = async (path, body) => {
          const signal = new Signal(path);
          const [effect, carry, steps] = traverse(vec, signal);
          if (!effect) throw new NotFound(signal);
          const inner = new Context({
            body, url: `http://internal${path}`, method: "POST",
          });
          inner.params = Object.assign(
            {}, ...steps.map(s => s.parameters).filter(Boolean),
          );
          await carry(inner, async (c) => {
            if (effect.length === 0) c.output = await effect();
            else if (effect.length === 1) c.output = await effect(c);
            else if (effect.length === 2) c.output = await effect(c.input, c);
          });
          return inner.output;
        };
        await next();
      };
    }

    vector.use(withCall(vector));
    vector.use(async (ctx, next) => {
      ctx.auth = "token-123";
      await next();
    });

    vector.open("lookup/:id", (ctx) => ({
      id: ctx.params.id,
      auth: ctx.auth,
    }));

    vector.open("aggregate", async (input, ctx) => {
      const a = await ctx.call("/lookup/1");
      const b = await ctx.call("/lookup/2");
      return { results: [a, b], auth: ctx.auth };
    });

    const handler = http(vector);

    specimen.it("direct lookup works", async () => {
      const res = await handler(new Request("http://localhost/lookup/5"));
      const body = await res.json();
      specimen.expect(body.id).toBe("5");
      specimen.expect(body.auth).toBe("token-123");
    });

    specimen.it("aggregate re-enters vector for inner calls", async () => {
      const res = await handler(new Request("http://localhost/aggregate"));
      const body = await res.json();
      specimen.expect(body.results[0].id).toBe("1");
      specimen.expect(body.results[1].id).toBe("2");
      specimen.expect(body.results[0].auth).toBe("token-123");
      specimen.expect(body.results[1].auth).toBe("token-123");
      specimen.expect(body.auth).toBe("token-123");
    });
  });
```

Note: the top-level `await import(...)` may need to be inside the describe callback or
at module top-level depending on how specimen handles async describe blocks. If it fails,
move the imports to the top of the file.

- [ ] **Step 2: Run test to verify it passes**

Run: `cd subsystems/vector && deno test -A --no-check tests/compiler/http.test.js`
Expected: PASS — re-entrant calls create independent Contexts, traverse runs per call

- [ ] **Step 3: Commit**

---

### Task 8: Wire Exports

**Files:**
- Modify: `subsystems/vector/compiler/index.js` — add http export
- Modify: `subsystems/vector/deno.jsonc` — add test task

- [ ] **Step 1: Export http from compiler index**

In `subsystems/vector/compiler/index.js`, add:

```js
export * from "./http.js";
```

- [ ] **Step 2: Add test task to vector deno.jsonc**

Add to `subsystems/vector/deno.jsonc` tasks:

```json
"test/compiler/http": "deno test -A --no-check --watch tests/compiler/http.test.js"
```

- [ ] **Step 3: Run full compiler test suite**

Run: `cd subsystems/vector && deno test -A --no-check tests/compiler/`
Expected: PASS — all compiler tests green (http + existing oak/object tests)

- [ ] **Step 4: Commit**

---

### Task 9: Final Verification

- [ ] **Step 1: Run typology tests**

Run: `cd subsystems/typology && deno test -A --no-check`
Expected: PASS — Context is additive, Response.type is additive

- [ ] **Step 2: Run vector tests**

Run: `cd subsystems/vector && deno test -A --no-check`
Expected: PASS — all vector tests green

- [ ] **Step 3: Verify http compiler is importable from package**

Quick smoke test:

```bash
cd /Users/finn/vivalence/code/vivalence
deno eval "import { http } from '@vivalence/vector/compiler'; import { Context } from '@vivalence/typology'; console.log('http:', typeof http, 'Context:', typeof Context);"
```

Expected: `http: function Context: function`
