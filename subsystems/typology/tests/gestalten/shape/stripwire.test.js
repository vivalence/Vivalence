import { specimen, shape, shard, v, Aperture, Connection, Url } from "@vivalence/typology";

const build = () => {
  const vector = new Aperture();
  vector.affect((ctx) => ({ index: true, echo: ctx.input?.ping }));
  vector.open({ nature: "/greet", input: v.object({ name: v.string() }) }, (ctx) => `hello ${ctx.input.name}`);
  vector.branch("/users").open("/:id", (ctx) => ctx.params.id);
  vector.branch("/users").branch("/:id").open("/profile", (ctx) => `profile of ${ctx.params.id}`);
  vector.open({ nature: "/ticks", yields: v.object({ tick: v.integer() }) }, async function* () {
    yield { tick: 1 };
    yield { tick: 2 };
  });
  vector.post("/submit", (ctx) => ({ got: ctx.input.value }));
  vector.get("/config", () => ({ ok: true }));
  return vector;
};

const sides = () => {
  const vector = build();
  const connection = new Connection(
    new Url("http://stripwire"),
    shard.transmitter.inline(shape.http(vector)),
  );
  return {
    local: shape.proxy(vector),
    remote: shape.connection.wire(connection, shape.strip(vector)),
  };
};

for (const [name, side] of Object.entries(sides())) {
  specimen.describe(`stripwire symmetry: ${name}`, () => {
    specimen.it("root effect: side() calls the node's own effect", async () => {
      specimen.expect(await side({ ping: "pong" })).toEqual({ index: true, echo: "pong" });
    });

    specimen.it("literal leaf", async () => {
      specimen.expect(await side.greet({ name: "beef" })).toBe("hello beef");
    });

    specimen.it("parameter leaf binds the segment value", async () => {
      specimen.expect(await side.users.john()).toBe("john");
      specimen.expect(await side.users["123"]()).toBe("123");
    });

    specimen.it("parameter branch navigates through the bound value", async () => {
      specimen.expect(await side.users.john.profile()).toBe("profile of john");
    });

    specimen.it("yields leaf streams packets — spelling: await then iterate", async () => {
      const packets = [];
      for await (const packet of await side.ticks({})) packets.push(packet);
      specimen.expect(packets).toEqual([{ tick: 1 }, { tick: 2 }]);
    });

    specimen.it("single-method leaf is a transparent callable", async () => {
      specimen.expect(await side.submit({ value: 3 })).toEqual({ got: 3 });
      specimen.expect(await side.config()).toEqual({ ok: true });
    });
  });
}

specimen.describe("stripwire strip metadata", () => {
  specimen.it("plucks yields and methods onto each node's effect", () => {
    const stripped = shape.strip(build());
    specimen.expect(stripped.effect).toBeTruthy();
    specimen.expect(stripped.branches.ticks.effect.yields).toBeTruthy();
    specimen.expect(stripped.branches.submit.effect.methods).toEqual(["POST"]);
    specimen.expect(stripped.branches.config.effect.methods).toEqual(["GET"]);
  });

  specimen.it("wire throws on a method-ambiguous leaf", () => {
    const vector = new Aperture();
    vector.get("/both", () => "read");
    vector.post("/both", () => "write");
    const connection = new Connection(
      new Url("http://stripwire"),
      shard.transmitter.inline(shape.http(vector)),
    );
    let threw = false;
    try {
      shape.connection.wire(connection, shape.strip(vector));
    } catch (error) {
      threw = error.message.includes("method-ambiguous");
    }
    specimen.expect(threw).toBe(true);
  });
});
