// import proposedUnits from "/Users/finn/vivalence/code/app/packages/postgres/proposed-units-sconj-0.json";

// remedy unit autcomplete
export default async function autocomplete(input, locals) {
  const { supabase, post } = locals;
  const { prompt, schema } = input;
  if (!prompt) throw new Error("prompt is required");
  if (typeof prompt !== "string") throw new Error("prompt must be a string");
  if (!schema) throw new Error("schema is required");
  if (!schema.provider) throw new Error("schema.provider is required");

  const proposedUnits = await (async function fromLLM() {
    // services.llm
    const { data: units, error } = await locals.get("/api/llm", {
      prompt,
      schema,
      provider: { api: "openai", model: "gpt-4o" },
    });
    if (error) throw error;
    return units;
  })();
  return proposedUnits;

  // validate, find or store
  proposedUnits.units
    .filter(async (unitData) => {
      const input = { unit: { data: unitData } };
      // self.api
      const { data: validation, error } = await locals.post(
        "/api/classifier/validate/unit",
        input,
      );

      if (error) console.error(error);
      console.log(unitData.spanish, "passes validation", validation.isValid);

      return validation.isValid;
    })
    .filter(async (unitData) => {
      const annotation = unitData.annotation;
      // self.api
      const { data: unit } = await locals.post("/api/units/fromAnnotation", { annotation });
      // console.log("unit", unit);
    });

  return {};
}
