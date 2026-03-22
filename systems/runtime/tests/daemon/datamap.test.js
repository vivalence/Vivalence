import { specimen, shard, RemoteRepository } from "@vivalence/typology";
import { create } from "../scenarios/daemon.js";

specimen.describe("daemon datamap", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("find literals", async () => {
    const result = await scenario.conn.call("/entities/literal/find", {
      where: {},
      options: { limit: 10 },
    });
    specimen.expect(result.length).toBe(2);
  });

  specimen.it("findOne literal by slug", async () => {
    const result = await scenario.conn.call("/entities/literal/findOne", {
      where: { slug: "hello" },
    });
    specimen.expect(result.slug).toBe("hello");
    specimen.expect(result.trait.TRANSLATED.learning).toBe("olá");
  });

  specimen.it("find symbols", async () => {
    const result = await scenario.conn.call("/entities/symbol/find", {
      where: {},
    });
    specimen.expect(result.length).toBe(1);
    specimen.expect(result[0].slug).toBe("greeting");
  });

  specimen.it("find intents", async () => {
    const result = await scenario.conn.call("/entities/intent/find", {
      where: {},
    });
    specimen.expect(result.length).toBe(1);
    specimen.expect(result[0].slug).toBe("survival-flashcard");
  });

  specimen.it("findOne intent by slug", async () => {
    const result = await scenario.conn.call("/entities/intent/findOne", {
      where: { slug: "survival-flashcard" },
    });
    specimen.expect(result.slug).toBe("survival-flashcard");
    specimen.expect(result.type).toBe("SELFEVIDENT");
    specimen.expect(result.traits).toEqual(["FURNISHED"]);
    specimen.expect(result.trait.FURNISHED.recall).toBe("LEARNING");
  });

  specimen.it("intent has mode relation", async () => {
    const result = await scenario.conn.call("/entities/intent/findOne", {
      where: { slug: "survival-flashcard" },
    });
    specimen.expect(result.mode).toBeTruthy();
  });

  specimen.it("create literal", async () => {
    const result = await scenario.conn.call("/entities/literal/create", {
      data: {
        slug: "obrigado",
        traits: ["TRANSLATED"],
        trait: { TRANSLATED: { known: "thanks", learning: "obrigado" } },
        symbol: {},
      },
    });
    specimen.expect(result.slug).toBe("obrigado");
    specimen.expect(result.id).toBeTruthy();
  });

  specimen.it("update literal", async () => {
    const result = await scenario.conn.call("/entities/literal/update", {
      where: { slug: "obrigado" },
      data: { trait: { TRANSLATED: { known: "thank you", learning: "obrigado" } } },
    });
    specimen.expect(result.trait.TRANSLATED.known).toBe("thank you");
  });

  specimen.it("remove literal", async () => {
    const result = await scenario.conn.call("/entities/literal/remove", {
      where: { slug: "obrigado" },
    });
    specimen.expect(result.ok).toBe(true);
  });

  specimen.it("findOne returns null for nonexistent", async () => {
    const result = await scenario.conn.call("/entities/literal/findOne", {
      where: { slug: "nonexistent" },
    });
    specimen.expect(result).toBeNull();
  });

  specimen.it("update nonexistent returns 404", async () => {
    const response = await scenario.conn.fetch("/entities/literal/update", {
      where: { slug: "nonexistent" },
      data: {},
    });
    specimen.expect(response.status).toBe(404);
  });

  specimen.it("sanitizes unsafe options", async () => {
    const result = await scenario.conn.call("/entities/literal/find", {
      where: {},
      options: { limit: 1, lockMode: "PESSIMISTIC_WRITE" },
    });
    specimen.expect(result.length).toBe(1);
  });

  specimen.it("/datamap returns stripped schema", async () => {
    const schema = await scenario.conn.call("/datamap");
    specimen.expect(schema).toBeTruthy();
    specimen.expect(schema.literal).toBeTruthy();
    specimen.expect(schema.literal.properties).toBeTruthy();
    specimen.expect(schema.session).toBeTruthy();
    specimen.expect(schema.session.properties.mode).toBeTruthy();
    specimen.expect(schema.session.properties.mode.kind).toBe("m:1");
  });

  specimen.it("wire repos from schema enables cross-repo hydration", async () => {
    const schema = await scenario.conn.call("/datamap");
    const mode = new RemoteRepository().connect(scenario.conn.branch("/entities/mode"));
    const intent = new RemoteRepository().connect(scenario.conn.branch("/entities/intent"));
    const session = new RemoteRepository().connect(scenario.authedConn.branch("/userspace/entities/session"));
    shard.datamap.wire({ mode, intent, session }, schema);

    specimen.expect(session._schema._stores.mode).toBe(mode);
    specimen.expect(intent._schema._stores.mode).toBe(mode);

    await mode.find();
    const intents = await intent.find({}, { populate: ["mode"] });
    specimen.expect(intents[0].mode).toBe(mode.$entities.get()[0]);
  });

  specimen.it("modes findOne by slug", async () => {
    const result = await scenario.conn.call("/modes/game/findOne", {
      where: { slug: "flashcard" },
    });
    specimen.expect(result.manifest.slug).toBe("flashcard");
  });

  specimen.it("BUFFERED mode includes buffered url and schema", async () => {
    const result = await scenario.conn.call("/modes/game/findOne", {
      where: { slug: "flashcard" },
    });
    specimen.expect(result.buffered.url).toBeTruthy();
    specimen.expect(result.buffered.schema.allOf).toBeTruthy();
  });

  specimen.it("mode has traits", async () => {
    const result = await scenario.conn.call("/modes/game/findOne", {
      where: { slug: "flashcard" },
    });
    specimen.expect(result.manifest.traits).toContain("SELFEVIDENT");
    specimen.expect(result.manifest.traits).toContain("INTENTED");
    specimen.expect(result.manifest.traits).toContain("EMITTER");
    specimen.expect(result.manifest.traits).toContain("BUFFERED");
  });

  // specimen.it("VIEWABLE mode includes view url", async () => {
  //   const result = await scenario.conn.call("/modes/game/findOne", { where: { slug: "flashcard" } });
  //   specimen.expect(result.view.url).toBeTruthy();
  // });
});
