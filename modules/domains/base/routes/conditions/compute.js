import pg from "pg";
import { validators, deepEquals, deepMerge, monads } from "@vivalence/shared";

export default async function (body, ctx) {
  const user = await ctx.runtime.services.identity.getUser();

  const condition = await read(body.condition, ctx);

  const met = await conditionResolver(condition, ctx);
  // This might blow up in the future. probably when the first memories run through here
  // hello future me, if you're reading this, you're welcome.
  // Fuck you past me, all you had to do was not hardcode a fucking  // met = false;
  // But otherwise this doesnt seem entirely unreasonable.

  const { data } = await ctx.runtime.services.supabase
    .from("Condition")
    .update({ met, updatedAt: new Date().toISOString() })
    .eq("id", condition.id)
    .select("id,met,updatedAt")
    .single();

  return { ...condition, ...data };
}

async function read(condition, ctx) {
  if (!condition?.id) throw new Error("Condition id is required");

  let query = ctx.runtime.services.supabase
    .from("Condition")
    .select("*")
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("id", condition.id);

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== "PGRST116") throw error;

  if (!data) throw new Error("Condition not found");
  return data;
}

// related to /pick/get ie implements same logic.
async function conditionResolver(condition, ctx) {
  let met;

  if (condition.scope.tag) {
    const tag = await ctx.runtime.call("/tags/fromSlug", { slug: condition.scope.tag.slug });

    const traits = tag.traits;
    const flavor = tag.data.LEARNABLE?.flavor || tag.data.COMPLETABLE?.flavor;

    let memories = [];
    if (traits.includes("LEARNABLE") && flavor === "INDIVIDUAL") {
      memories = await learnableIndividual({ tag }, ctx);
    } else if (traits.includes("LEARNABLE") && flavor === "RELATIONAL") {
      memories = await learnableRelational({ tag }, ctx);
    } else if (tag.traits.includes("COMPLETABLE") && flavor === "INDIVIDUAL") {
      memories = await completableIndividual({ tag }, ctx);
    } else if (tag.traits.includes("COMPLETABLE") && flavor === "RELATIONAL") {
      memories = await completableRelational({ tag }, ctx);
    }

    met = await validators.jsonata(condition.assertion.jsonata, memories);
  } else if (condition.scope.dependency) {
    const dependency = await ctx.runtime.call("/dependencies/compute", condition.scope);
    met = dependency.satisfied;
  }

  return met;
}

async function learnableIndividual({ tag }, ctx) {
  let memories = [];
  const { data, error } = await ctx.runtime.services.supabase
    .from("Memory")
    .select("id, tagId, unitId, status")
    .eq("tagId", tag.id)
    .is("unitId", null)
    .maybeSingle();
  if (error) throw error;
  memories.push(data?.status || "UNTOUCHED");
  return memories;
}
async function learnableRelational({ tag }, ctx) {
  const user = await ctx.runtime.services.identity.getUser();

  let memories = [];
  const { data: relations } = await ctx.runtime.services.supabase
    .from("_TagToUnit")
    .select("*")
    .eq("A", tag.id);

  const unitIds = relations.map((relation) => relation.B);

  const { rows: data } = await ctx.runtime.services.db.sql(
    `WITH unit_ids AS (SELECT UNNEST($1::text[]) AS unit_id)
SELECT id, "userId", "tagId", "unitId", status
FROM "Memory"
WHERE "tagId" = $2
AND "userId" = $3
AND "unitId" IN (SELECT unit_id FROM unit_ids); `,

    [unitIds, tag.id, user.id],
  );

  unitIds
    .map((unitId) => data.find((memory) => memory.unitId === unitId)?.status || "UNTOUCHED")
    .map((status) => memories.push(status || "UNTOUCHED"));

  return memories;
}

async function completableIndividual({ tag }, ctx) {
  const user = await ctx.runtime.services.identity.getUser();

  let memories = [];
  const { data: relations } = await ctx.runtime.services.supabase
    .from("_TagToUnit")
    .select("*")
    .eq("A", tag.id);

  const unitIds = relations.map((relation) => relation.B);

  const { rows: data } = await ctx.runtime.services.db.sql(
    `WITH unit_ids AS (SELECT UNNEST($1::text[]) AS unit_id)
SELECT id, "userId", "tagId", "unitId", status
FROM "Memory"
WHERE "tagId" = $2
AND "userId" = $3
AND "unitId" IN (SELECT unit_id FROM unit_ids); `,

    [unitIds, tag.id, user.id],
  );

  unitIds
    .map((unitId) => data.find((memory) => memory.unitId === unitId)?.status || "UNTOUCHED")
    .map((status) => memories.push(status || "UNTOUCHED"));

  return memories;
}
async function completableRelational({ tag }, ctx) {
  let memories = [];

  const { data: relations } = await ctx.runtime.services.supabase
    .from("_TagToUnit")
    .select(
      "A, unit:Unit(id, memories:Memory(id, unitId, tagId, status), relations:_TagToUnit(A, B))",
    )
    .eq("A", tag.id);

  relations.map(({ unit }) =>
    unit.relations.map(({ A, B }) => {
      memories.push(
        unit.memories.find((memory) => memory.unitId === B && memory.tagId === A)?.status ||
          "UNTOUCHED",
      );
    }),
  );

  return memories;
}
