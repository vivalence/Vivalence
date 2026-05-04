import { specimen } from "@vivalence/typology";
import { LocalRepository } from "@vivalence/typology";
import { wireDossier, compileSchema } from "../../src/typology/prototypes/dossier.js";

class Widget {
  id = null;
  slug = null;
  constructor(data) { Object.assign(this, data); }
}

specimen.describe("dossier: wireDossier", () => {
  specimen.it("constructs repo via dossier.repository thunk", () => {
    const schema = {
      name: "widget",
      kind: () => Widget,
      repository: (schema) => new LocalRepository({ kind: schema.kind() }),
    };
    const repo = wireDossier(schema);
    specimen.expect(repo).toBeInstanceOf(LocalRepository);
    specimen.expect(repo.kind).toBe(Widget);
  });

  specimen.it("attaches hydrate function", () => {
    const schema = {
      name: "widget",
      kind: () => Widget,
      repository: () => new LocalRepository({ kind: Widget }),
    };
    const repo = wireDossier(schema);
    specimen.expect(typeof repo.hydrate).toBe("function");
  });
});

specimen.describe("dossier: middleware pipeline", () => {
  specimen.it("middleware runs on cast with ctx carrying schema/name/repo/entity", async () => {
    const seen = [];
    const schema = {
      name: "widget",
      kind: () => Widget,
      repository: () => new LocalRepository({ kind: Widget }),
      use: [
        async (ctx, next) => {
          await next();
          seen.push({
            schema: ctx.schema,
            name: ctx.name,
            repo: ctx.repo,
            entity: ctx.entity,
            widget: ctx.widget,
          });
        },
      ],
    };
    const repo = wireDossier(schema);
    const entity = await repo.create({ slug: "a" });
    specimen.expect(seen.length).toBe(1);
    specimen.expect(seen[0].schema).toBe(schema);
    specimen.expect(seen[0].name).toBe("widget");
    specimen.expect(seen[0].repo).toBe(repo);
    specimen.expect(seen[0].entity).toBe(entity);
    specimen.expect(seen[0].widget).toBe(entity);
  });

  specimen.it("multiple use middlewares run in order", async () => {
    const calls = [];
    const schema = {
      name: "widget",
      kind: () => Widget,
      repository: () => new LocalRepository({ kind: Widget }),
      use: [
        async (ctx, next) => { calls.push("a"); await next(); calls.push("a-after"); },
        async (ctx, next) => { calls.push("b"); await next(); calls.push("b-after"); },
      ],
    };
    const repo = wireDossier(schema);
    await repo.create({ slug: "x" });
    specimen.expect(calls).toEqual(["a", "b", "b-after", "a-after"]);
  });

  specimen.it("use middleware can enrich entity", async () => {
    const schema = {
      name: "widget",
      kind: () => Widget,
      repository: () => new LocalRepository({ kind: Widget }),
      use: [
        async (ctx, next) => {
          await next();
          ctx.entity.enriched = true;
        },
      ],
    };
    const repo = wireDossier(schema);
    const entity = await repo.create({ slug: "e" });
    specimen.expect(entity.enriched).toBe(true);
  });
});

specimen.describe("dossier: defaultCast", () => {
  specimen.it("routes through repo.cast when present (LocalRepo path)", async () => {
    const schema = {
      name: "widget",
      kind: () => Widget,
      repository: () => new LocalRepository({ kind: Widget }),
    };
    const repo = wireDossier(schema);
    const entity = await repo.create({ slug: "l" });
    specimen.expect(entity).toBeInstanceOf(Widget);
    specimen.expect(entity.slug).toBe("l");
  });
});
