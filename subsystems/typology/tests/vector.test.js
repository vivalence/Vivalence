import { Path, shape, specimen, steer, v, Signal, Vector } from "@vivalence/typology";

specimen.describe("Vector", () => {
  specimen.it("a vector grows its trie and merges by nature", () => {
    const vector = new Vector();
    specimen.expect(vector.effect).toBe(null);
    specimen.expect(vector.trie.size).toBe(0);
    specimen.expect(vector.carry).toEqual([]);

    const users = vector.branch("users");
    specimen.expect(users).toBeInstanceOf(Vector);
    specimen.expect(vector.trie.size).toBe(1);
    specimen.expect(vector.branch("users")).toBe(users);
    specimen.expect(vector.trie.size).toBe(1);

    const posts = vector.branch("posts");
    specimen.expect(users).not.toBe(posts);
    specimen.expect(vector.trie.size).toBe(2);
  });

  specimen.it("an effect opens onto a leaf", () => {
    const flat = new Vector();
    const greeting = () => {};
    flat.open("greet", greeting);
    specimen.expect(flat.trie.size).toBe(1);
    specimen.expect(flat.branch("greet").effect).toBe(greeting);

    const deep = new Vector();
    const fetchUser = () => {};
    deep.open("/users/:id", fetchUser);
    specimen.expect(deep.trie.size).toBe(1);
    const users = deep.branch("users");
    specimen.expect(users.trie.size).toBe(1);
    specimen.expect(users.patterns[0].nature).toBe(":id");
    specimen.expect(users.branch(":id").effect).toBe(fetchUser);

    const contested = new Vector();
    const first = () => "a";
    const second = () => "b";
    contested.open("x", first).open("x", second);
    specimen.expect(contested.branch("x").effect).toBe(second);

    const dual = new Vector();
    const namedEffect = () => "named";
    const anonymousEffect = () => "anon";
    specimen.expect(dual.open("ping", namedEffect).affect(anonymousEffect)).toBe(dual);
    specimen.expect(dual.effect).toBe(anonymousEffect);
    specimen.expect(dual.branch("ping").effect).toBe(namedEffect);
  });

  specimen.it("a descriptor dresses the edge", () => {
    const described = new Vector();
    const feedInput = v.object({ limit: v.integer(), where: v.any() });
    described.open({ nature: "/feed", input: feedInput, valence: "fetch items" }, () => {});
    specimen.expect(described.branch("feed")).toBeDefined();

    const edged = new Vector();
    const emitInput = v.object({ recall: v.string(), gameplay: v.string() });
    const emitEffect = () => {};
    edged.open({ nature: "/emit/literal", input: emitInput }, emitEffect);
    const emit = edged.branch("emit");
    const pattern = emit.patterns[0];
    specimen.expect(pattern.nature).toBe("literal");
    specimen.expect(pattern.input).toBe(emitInput);
    specimen.expect(emit.branch("literal").effect).toBe(emitEffect);

    const functional = new Vector();
    const limitInput = v.object({ limit: v.integer() });
    functional.open(() => ({ nature: "/feed", input: limitInput }), () => {});
    specimen.expect(functional.branch("feed")).toBeDefined();
  });

  specimen.it("middleware rides the carry, never the branches", () => {
    const vector = new Vector();
    const firstMiddleware = async (context, next) => next();
    const secondMiddleware = async (context, next) => next();
    vector.use(firstMiddleware).use(secondMiddleware);
    specimen.expect(vector.carry.length).toBe(2);
    specimen.expect(vector.carry[0]).toBe(firstMiddleware);
    specimen.expect(vector.carry[1]).toBe(secondMiddleware);
    specimen.expect(vector.branch("test").carry.length).toBe(0);
  });

  specimen.it("graft owns: nothing leaks back into the source, source untouched", () => {
    const source = new Vector().open("/a", () => 1).open("/b/c", () => 2);
    const before = { effect: source.effect, carry: source.carry.length, trie: source.trie.size };
    const destination = new Vector().graft(source);
    specimen.expect(source.effect).toBe(before.effect);
    specimen.expect(source.carry.length).toBe(before.carry);
    specimen.expect(source.trie.size).toBe(before.trie);

    destination.branch("b").open("d", () => 3);
    specimen.expect(source.branch("b").patterns.map((p) => p.nature)).toEqual(["c"]);
    source.open("/e", () => 4);
    specimen.expect(destination.edge("e")).toBe(null);
    specimen.expect(destination.branch("a")).not.toBe(source.branch("a"));
  });

  specimen.it("graft collision: later wins on effect AND edge, both sources unmutated", () => {
    const base = new Vector().open({ nature: "/literal/find", valence: "plain prose", input: { base: true } }, () => "base");
    const override = new Vector().open({ nature: "/literal/find", valence: "rich prose" }, () => "override");

    const armed = new Vector().graft(base).graft(override);

    const findNode = (vector) => {
      const literal = vector.descendants[0];
      return [...literal.trie][0];
    };

    const [edge, node] = findNode(armed);
    specimen.expect(node.effect()).toBe("override");
    specimen.expect(edge.valence).toBe("rich prose");

    const [baseEdge, baseNode] = findNode(base);
    specimen.expect(baseNode.effect()).toBe("base");
    specimen.expect(baseEdge.valence).toBe("plain prose");
    specimen.expect(baseEdge.input).toEqual({ base: true });

    const [overrideEdge, overrideNode] = findNode(override);
    specimen.expect(overrideNode.effect()).toBe("override");
    specimen.expect(overrideEdge.valence).toBe("rich prose");
  });

  specimen.it("self-graft is a no-op, never a loop", () => {
    const vector = new Vector().open({ nature: "/find", valence: "prose" }, () => "self");
    specimen.expect(vector.graft(vector)).toBe(vector);
    specimen.expect(vector.trie.size).toBe(1);
    specimen.expect(vector.carry.length).toBe(0);
    specimen.expect(vector.descendants[0].effect()).toBe("self");
  });

  specimen.it("graft(...vectors) · use(...middlewares) are variadic, in order; do() sets the effect, affect() is its alias — sources untouched", () => {
    const first = new Vector().open({ nature: "/a", valence: "a" }, () => "a");
    const second = new Vector().open({ nature: "/b", valence: "b" }, () => "b").do(() => "root");
    const one = () => {};
    const two = () => {};
    const armed = new Vector().use(one, two).graft(first, second);
    specimen.expect(armed.patterns.map((pattern) => pattern.nature)).toEqual(["a", "b"]);
    specimen.expect(armed.effect()).toBe("root");
    specimen.expect(armed.carry).toEqual([one, two]);
    specimen.expect(new Vector().affect(() => "x").effect()).toBe("x");
    specimen.expect(first.trie.size).toBe(1);
    specimen.expect(second.trie.size).toBe(1);
  });

  specimen.it("the trie keys by nature: one edge per sibling nature, declaration order immovable — a collision holds its slot", () => {
    const vector = new Vector();
    vector.branch("first");
    vector.branch(":param");
    vector.branch("first");
    specimen.expect(vector.trie.size).toBe(2);
    specimen.expect(vector.patterns.map((pattern) => pattern.nature)).toEqual(["first", ":param"]);

    const base = new Vector().open("/a", () => 1).open("/b", () => 2);
    const override = new Vector().open("/a", () => 3);
    const merged = new Vector().graft(base).graft(override);
    specimen.expect(merged.patterns.map((pattern) => pattern.nature)).toEqual(["a", "b"]);
    specimen.expect(merged.branch("a").effect()).toBe(3);
  });

  specimen.it("graft collision keeps the earlier effect when the later side has none", () => {
    const base = new Vector().open({ nature: "/find" }, () => "base");
    const branchOnly = new Vector();
    branchOnly.branch("/find").branch("deep");

    const merged = new Vector().graft(base).graft(branchOnly);
    const node = merged.descendants[0];
    specimen.expect(node.effect()).toBe("base");
    specimen.expect(node.patterns.some((edge) => edge.nature === "deep")).toBe(true);
  });

  specimen.it("branch(sig, vector) attaches: the edge IS the vector", () => {
    const service = new Vector().open("/find", () => "find");
    const root = new Vector();
    const mounted = root.branch("svc", service);
    specimen.expect(mounted).toBe(service);
    specimen.expect(root.branch("svc")).toBe(service);
    specimen.expect([...root.trie.values()][0]).toBe(service);
  });

  specimen.it("attached vectors are live at every depth, including new top-level branches", () => {
    const service = new Vector().open("/find", () => "find");
    const root = new Vector();
    root.branch("svc", service);

    service.open("/count", () => "count");
    specimen.expect(root.branch("svc").branch("count").effect()).toBe("count");

    service.use(() => {});
    specimen.expect(root.branch("svc").carry.length).toBe(1);

    service.branch("find").open("deep", () => "deep");
    specimen.expect(root.branch("/svc/find/deep").effect()).toBe("deep");
  });

  specimen.it("attach through a path mints intermediates and lands the vector on the leaf", () => {
    const leaf = new Vector().open("/x", () => "x");
    const root = new Vector();
    const result = root.branch("/a/b/c", leaf);
    specimen.expect(result).toBe(leaf);
    specimen.expect(root.branch("a")).not.toBe(leaf);
    specimen.expect(root.branch("/a/b")).not.toBe(leaf);
    specimen.expect(root.branch("/a/b/c")).toBe(leaf);
    specimen.expect(root.branch("a").ancestor).toBe(root);
    specimen.expect(root.branch("/a/b").ancestor).toBe(root.branch("a"));
  });

  specimen.it("attach onto an occupied edge degrades to graft: existing node kept, contents copied in", () => {
    const root = new Vector();
    const existing = root.branch("svc").open("/own", () => "own");
    const incoming = new Vector().open("/find", () => "find").use(() => {});

    const result = root.branch("svc", incoming);
    specimen.expect(result).toBe(existing);
    specimen.expect(existing.branch("own").effect()).toBe("own");
    specimen.expect(existing.branch("find").effect()).toBe("find");
    specimen.expect(existing.carry.length).toBe(1);

    incoming.open("/later", () => "later");
    specimen.expect(existing.edge("later")).toBe(null);
    existing.open("/mine", () => "mine");
    specimen.expect(incoming.edge("mine")).toBe(null);
  });

  specimen.it("attach through an occupied path still lands and grafts at the leaf only", () => {
    const root = new Vector();
    const a = root.branch("a");
    const leaf = new Vector().open("/x", () => "x");
    specimen.expect(root.branch("/a/b", leaf)).toBe(leaf);
    specimen.expect(root.branch("a")).toBe(a);
    specimen.expect(a.trie.size).toBe(1);

    const second = new Vector().open("/y", () => "y");
    specimen.expect(root.branch("/a/b", second)).toBe(leaf);
    specimen.expect(leaf.branch("y").effect()).toBe("y");
    specimen.expect(leaf.branch("x").effect()).toBe("x");
  });

  specimen.it("one vector attached under two parents is the same node from both", () => {
    const shared = new Vector().open("/ping", () => "pong");
    const left = new Vector();
    const right = new Vector();
    left.branch("s", shared);
    right.branch("t", shared);
    shared.open("/new", () => "new");
    specimen.expect(left.branch("/s/new").effect()).toBe("new");
    specimen.expect(right.branch("/t/new").effect()).toBe("new");
    specimen.expect(left.branch("s")).toBe(right.branch("t"));
  });

  specimen.it("open on a mounted vector writes into the source — attach is one node, not two", () => {
    const daemon = new Vector();
    const root = new Vector();
    const branch = root.branch("d", daemon);
    branch.open("/manifest", () => "m");
    specimen.expect(daemon.branch("manifest").effect()).toBe("m");
  });

  specimen.it("branch(sig, vector) with a nature-less signature returns this and attaches nothing", () => {
    const root = new Vector();
    const v = new Vector();
    specimen.expect(root.branch("/", v)).toBe(root);
    specimen.expect(root.trie.size).toBe(0);
  });

  specimen.it("graft merges two patterns for one key field by field — later wins, a bare segment keeps the earlier valence; the sources are not mutated", () => {
    const declared = new Vector();
    declared.branch({ nature: "leader", valence: "the leader" }).branch({ nature: "d", valence: "display" });
    const derived = new Vector().open({ nature: "leader/d/d", valence: "/dock", input: v.object({}) }, "/dock");
    const reworded = new Vector().open({ nature: "leader/d/d", valence: "the dock" }, "/dock");
    const merged = new Vector().graft(declared, derived, reworded);
    const [leader, leading] = merged.edge("leader");
    const [d, display] = leading.edge("d");
    const [dock] = display.edge("d");
    specimen.expect([leader.valence, d.valence]).toEqual(["the leader", "display"]);
    specimen.expect([dock.valence, dock.input !== undefined]).toEqual(["the dock", true]);
    specimen.expect(derived.branch("leader/d").edge("d")[0].valence).toBe("/dock");
  });

  specimen.it("scope asks the literals first and the * only when none matched; a * mid-path is walked through", () => {
    const vector = new Vector().open("*", () => "any").open("ctrl-v", () => "leader").open("proxy/*/status", () => "status");
    specimen.expect(steer.match.scope(vector, new Signal("ctrl-v")).map(([match]) => match.nature)).toEqual(["ctrl-v"]);
    specimen.expect(steer.match.scope(vector, new Signal("d")).map(([match]) => match.type)).toEqual(["wildcard"]);
    specimen.expect(steer.dispatch.traverse(vector, new Signal("/proxy/anything/status"))[0]).not.toBe(null);
  });

  specimen.it("trim drops the edge at the end of a /nature path, its siblings and ancestors stay", () => {
    const vector = new Vector().open("a/b", () => "b").open("a/c", () => "c").open("d", () => "d");
    vector.trim("/a/b").trim("/absent/x");
    const paths = steer.trie.leaves(vector).map((leaf) => leaf.steps.map((step) => step.nature).join("/"));
    specimen.expect(paths).toEqual(["a/c", "d"]);
    vector.trim("a");
    specimen.expect(vector.patterns.map((pattern) => pattern.nature)).toEqual(["d"]);
  });

  specimen.it("graft copies the pattern: a later merge never reaches the source", () => {
    const client = new Vector().open({ nature: "/filter", valence: "narrow the list" }, () => "narrow");
    const repl = new Vector().graft(client);
    specimen.expect(repl.edge("filter")[0]).not.toBe(client.edge("filter")[0]);

    const before = repl.edge("filter")[0];
    repl.graft(new Vector().open({ nature: "/filter", valence: "the mode's filter" }, () => "own"));
    specimen.expect(repl.edge("filter")[0]).toBe(before);
    specimen.expect(before.valence).toBe("the mode's filter");
    specimen.expect(client.edge("filter")[0].valence).toBe("narrow the list");
  });

  specimen.it("seat copies every declared key and none of the chain", () => {
    const source = new Vector().open({ nature: "/deep/keep", valence: "kept", rank: "hidden" }, () => "keep");
    const copy = new Vector().graft(source);
    const [deep] = copy.edge("deep");
    const [leaf] = copy.branch("deep").edge("keep");
    specimen.expect([leaf.valence, leaf.rank]).toEqual(["kept", "hidden"]);
    specimen.expect([deep.heir, deep.trace, leaf.trace]).toEqual([undefined, null, null]);
  });

  specimen.it("a branched Path mounts and trims at its own nature — identity, never linkage", () => {
    const reference = new Path("/runtime/house");
    reference.branch("/mode/reader/reader");
    const root = new Vector();
    root.branch(reference, new Vector().open("/status", () => "up"));
    specimen.expect(Object.keys(shape.strip(root).branches.runtime.branches.house.branches)).toEqual(["status"]);
    specimen.expect(reference.heir.nature).toBe("/mode/reader/reader");
    root.trim(reference);
    specimen.expect(Object.keys(shape.strip(root).branches.runtime.branches)).toEqual([]);
  });

  specimen.it("a key nobody listed still rides", () => {
    const source = new Vector().open({ nature: "/x", mood: "curious" }, () => "x");
    specimen.expect(new Vector().graft(source).edge("x")[0].mood).toBe("curious");
  });

  specimen.it("branch merges a later declaration onto the edge; a bare mention changes nothing", () => {
    const vector = new Vector();
    vector.branch("x");
    vector.branch({ nature: "x", valence: "later" });
    vector.branch("x");
    specimen.expect(vector.patterns.map((pattern) => [pattern.nature, pattern.valence])).toEqual([["x", "later"]]);
  });

  specimen.it("a merge holds the route order: :id still answers before :slug", async () => {
    const base = new Vector().open("/users/:id", () => "id").open("/users/:slug", () => "slug");
    const merged = new Vector().graft(base).graft(new Vector().open({ nature: "/users/:slug", valence: "by slug" }, () => "slug"));
    specimen.expect(merged.branch("users").patterns.map((pattern) => pattern.nature)).toEqual([":id", ":slug"]);
    specimen.expect(await steer.dispatch.execute(merged, {}, new Signal("/users/7"))).toBe("id");
  });

  specimen.it("a later effect replaces the earlier on do, open and graft alike", async () => {
    const done = new Vector().do(() => "first").do(() => "second");
    specimen.expect(await steer.dispatch.execute(done, {})).toBe("second");
    const opened = new Vector().open("/x", () => "first").open("/x", () => "second");
    specimen.expect(await steer.dispatch.execute(opened, {}, new Signal("/x"))).toBe("second");
    const grafted = new Vector().do(() => "first").graft(new Vector().do(() => "second"));
    specimen.expect(await steer.dispatch.execute(grafted, {})).toBe("second");
    specimen.expect(new Vector().do(() => "first").do(() => "second")).toBeInstanceOf(Vector);
  });
});
