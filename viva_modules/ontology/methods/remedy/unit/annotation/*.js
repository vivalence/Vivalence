async function invalid(issue, ctx) {
  const unit = issue.context.unit;

  const invalidAnnotationKey = issue.path[issue.path.length - 1];
  const invalidAnnotationValue = issue.context.error.data;

  delete unit.data.annotation[invalidAnnotationKey];

  const result = await ctx.locals.supabase
    .from("Unit")
    .update({
      updatedAt: new Date().toISOString(),
      data: unit.data,
    })
    .eq("id", unit.id);

  return { resolved: !result.error, unit, from: "hardcode" };
}

async function mismatch(issue, ctx) {
  const schema = ctx.runtime.module.schema;
  const unit = issue.context.unit;
  const patch = issue.context.patch;
  const pos = unit.data.annotation.pos;
  let resolved = { resolved: false, unit: null, tag: null };

  if (patch && patch.ontology) {
    unit.data.annotation[patch.ontology.branch] = patch.ontology.leaf;
    resolved = { ...resolved, resolved: true, unit, from: "patch.ontology" };
  } else if (issue.path[issue.path.length - 1] === "pos") {
    const newPos = await (async function fromLLM() {
      // services.llm
      const { data: choice, error } = await ctx.services.llm({
        prompt: (() => {
          const demoData = { ...unit.data };
          delete demoData.annotation;
          return `### Task
Identify the Part of Speech (defined by Universal Dependencies) of a spanish word.
Strongly prefere verb over aux.

### Input
\`\`\`json
${JSON.stringify(demoData, null, 2)}
\`\`\`

### Output
\`\`\`json
{"pos": "${schema.annotations.pos.enum.filter((e) => e !== "aux").join('" | "')}"}
`;
        })(),
        schema: {
          title: "Part of Speech (POS) Tagging",
          type: "object",
          properties: {
            pos: schema.annotations.pos,
          },
        },
        provider: {
          api: "openai",
          model: "gpt-4o",
        },
      });
      if (error) throw error;
      const { pos: newPos } = choice;

      if (!newPos || !schema.annotations.pos.enum.includes(newPos)) {
        throw new Error("[invalid LLM response]", choice, issue);
      } else {
        return newPos;
      }
    })();
    unit.data.annotation = { pos: newPos, lemma: unit.data.annotation.lemma };
    resolved = { ...resolved, resolved: true, unit, from: "llm" };
  } else {
    throw new Error("UNHANDLED MISMATCH ISSUE", issue);
  }

  const { error: unitDataError } = await ctx.locals.supabase
    .from("Unit")
    .update({
      updatedAt: new Date().toISOString(),
      data: unit.data,
    })
    .eq("id", unit.id);
  if (unitDataError) throw unitDataError;

  if (pos !== unit.data.annotation.pos) {
    // remove any pos from tags
    await (async function removePosTags() {
      const tags = unit.tags.filter((tag) => tag.data.ONTOLOGICAL?.branch === "pos");
      for (const tag of tags) {
        const { error: tagRemovalError } = await ctx.locals.supabase
          .from("_TagToUnit")
          .delete()
          .eq("A", tag.id)
          .eq("B", unit.id);
        if (tagRemovalError) throw tagRemovalError;
      }
    })();

    // find & connect to new pos tag
    await (async function connectPosTag() {
      const { data: tag, error: tagError } = await ctx.locals.supabase
        .from("Tag")
        .select(`*`)
        .eq(`data->ONTOLOGICAL->>branch`, "pos")
        .eq(`data->ONTOLOGICAL->>leaf`, pos)
        .single();
      if (tagError) throw tagError;
      const result = await ctx.locals.supabase
        .from("_TagToUnit")
        .upsert({ A: tag.id, B: unit.id });
      if (result.error) throw result.error;
      resolved = { resolved: !result.error, unit, tag, from: "llm" };
    })();
  }

  return resolved;
}

// @lj
// invalid & required might cause oscillation.
// invalid deletes the annotation key,
// required adds the annotation key from tag.
// if the tag is faulty, it will never be resolved,
// instead the handlers will keep toggling the annotation key.
// SOLUTION: either removed the tag too, or ask llm.

async function required(issue, ctx) {
  const schema = ctx.runtime.module.schema;
  const unit = issue.context.unit;
  const requiredAnnotationKey = issue.context.error.params.missingProperty;

  let resolved = { resolved: false, unit: null };

  await (async function fromTag() {
    const missingTag = unit.tags.find((tag) => {
      return tag.data.ONTOLOGICAL?.branch === requiredAnnotationKey;
    });
    if (missingTag) {
      unit.data.annotation[requiredAnnotationKey] = missingTag.data.ONTOLOGICAL.leaf;
      const result = await ctx.locals.supabase
        .from("Unit")
        .update({
          updatedAt: new Date().toISOString(),
          data: unit.data,
        })
        .eq("id", unit.id);
      resolved = { resolved: !result.error, unit, tag: missingTag, from: "tag" };
    }
  })();
  if (resolved.resolved) return resolved;

  await (async function fromLLM() {
    const { schema } = units[unit.data.annotation.pos];
    const property = schema.properties.annotation.properties[requiredAnnotationKey];

    // services.llm
    const { data, error } = await ctx.services.llm({
      prompt: (() => {
        return `### Task
You autocomplete the missing annotation for property key: "${requiredAnnotationKey}".

### Input
\`\`\`json
${JSON.stringify(unit.data, null, 2)}
\`\`\`

### Output
\`\`\`json
{"${requiredAnnotationKey}": ""}
`;
      })(),
      schema: {
        properties: {
          [requiredAnnotationKey]: property,
        },
      },
      provider: {
        api: "openai",
        model: "gpt-4o",
      },
    });
    if (error) throw error;
    if (!!data[requiredAnnotationKey] && property.enum.includes(data[requiredAnnotationKey])) {
      unit.data.annotation[requiredAnnotationKey] = data[requiredAnnotationKey];
      const result = await ctx.locals.supabase
        .from("Unit")
        .update({
          updatedAt: new Date().toISOString(),
          data: unit.data,
        })
        .eq("id", unit.id);
      resolved = { resolved: !result.error, unit, from: "llm" };
    } else {
      console.log("[invalid LLM response]:", data);
      console.log(
        `if ${
          JSON.stringify(issue.context.error.data, null, 2)
        } is verb but misses verbform, then thats the ajv bug.`,
      );
      console.log(`unit:`, unit.id);
      throw new Error("[invalid LLM response]");
    }
  })();
  return resolved;
}

async function forbidden(issue, lctx) {
  const schema = ctx.runtime.module.schema;
  const unit = issue.context.unit;
  const forbiddenAnnotationKey = issue.path[issue.path.length - 1];
  delete unit.data.annotation[forbiddenAnnotationKey];
  const result = await ctx.locals.supabase
    .from("Unit")
    .update({
      updatedAt: new Date().toISOString(),
      data: unit.data,
    })
    .eq("id", unit.id);
  return { resolved: !result.error, unit, from: "hardcode" };
}

export default {
  handlers: { required, invalid, forbidden, mismatch },
  path: ["*"],
};
