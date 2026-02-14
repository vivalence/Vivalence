import { validators, object } from "@vivalence/shared";

export async function schema(daemonDie) {
  daemonDie.good.schema.annotation = baseAnnotationSchema();
  daemonDie.good.schema.annotations = {};
  daemonDie.good.schema.literal = baseLiteralSchema(
    daemonDie.kernel.domain.topography.schematics.literal,
  );
  daemonDie.good.schema.literals = {};

  const dimensions = await daemonDie.good.entities.dimension //
    .find({ ancestor: null });

  for (const dimension of dimensions) {
    await dimension.descendants.init();
    applyDimensionToBase(daemonDie.good.schema.annotation, dimension);
  }

  const subjects = await daemonDie.good.entities.subject.find({});

  for (const subject of subjects) {
    const annotationSchema = await buildSubjectAnnotationSchema(
      subject,
      daemonDie.good,
    );
    daemonDie.good.schema.annotations[subject.slug] = annotationSchema;

    const literalSchema = buildSubjectLiteralSchema(
      subject,
      annotationSchema,
      daemonDie.good.schema.literal,
    );
    daemonDie.good.schema.literals[subject.slug] = literalSchema;
  }
}

function applyDimensionToBase(schema, dimension) {
  const dimSchema = {
    type: "string",
    title: dimension.name || dimension.slug,
    description: dimension.description || "",
  };

  if (dimension.traits.includes("CATEGORICAL")) {
    const categories = dimension.descendants.getItems();
    dimSchema.enum = categories.map(({ slug }) => slug);

    const descriptions = categories
      .map(
        ({ slug, name, description }) =>
          `${slug} (${name || ""}: ${description || ""})`,
      )
      .join(", ");
    dimSchema.description += ` Values: [${descriptions}]`;
  }

  if (dimension.traits.includes("TOPOGRAPHICAL")) {
    dimSchema.description += " [TOPOGRAPHICAL: functions as primary key]";
  }

  schema.properties[dimension.slug] = dimSchema;
}

async function buildSubjectAnnotationSchema(subject, daemon) {
  const schema = {
    type: "object",
    title: subject.name || subject.slug,
    description: subject.description || "",
    properties: {},
    required: [],
    allOf: [],
    additionalProperties: false,
  };

  for (const rule of subject.dimensions || []) {
    if (rule.branch) {
      await applyBranchRule(schema, rule, daemon);
    } else if (rule.condition) {
      schema.allOf.push(rule.condition);
    }
  }

  if (schema.allOf.length === 0) {
    delete schema.allOf;
  }

  return schema;
}

async function applyBranchRule(schema, rule, daemon) {
  const [dimensionSlug, ...leafSpec] = rule.branch;

  // Fetch dimension from database
  const dimension = await daemon.entities.dimension.findOne({
    slug: dimensionSlug,
    ancestor: null,
  });

  if (!dimension) {
    console.warn(`[schema] Dimension not found: ${dimensionSlug}`);
    return;
  }

  await dimension.descendants.init();

  const propSchema = {
    type: "string",
    title: dimension.name || dimension.slug,
    description: dimension.description || "",
  };

  // Handle leaf specification
  if (leafSpec.length > 0) {
    const leaf = leafSpec[0];

    if (leaf === "*") {
      // Wildcard - allow any value (FREE dimension)
      propSchema.type = "string";
    } else if (Array.isArray(leaf)) {
      // Specific allowed values
      propSchema.enum = leaf;
    } else if (typeof leaf === "string") {
      // Single fixed value
      propSchema.const = leaf;
    }
  } else if (dimension.traits.includes("CATEGORICAL")) {
    // Use all categories from dimension
    const categories = dimension.descendants.getItems();
    propSchema.enum = categories.map(({ slug }) => slug);
  }

  schema.properties[dimensionSlug] = propSchema;

  if (rule.required) {
    schema.required.push(dimensionSlug);
  }
}

function baseAnnotationSchema() {
  return {
    type: "object",
    title: "Annotation",
    description: "Base annotation schema",
    properties: {},
    required: [],
    additionalProperties: false,
  };
}

function baseLiteralSchema(literaldataschema) {
  return {
    type: "object",
    title: "Literal",
    description: "Base literal schema",
    properties: {
      // id: { type: "string" },
      slug: { type: "string" },
      // name: { type: ["string", "null"] },
      // description: { type: ["string", "null"] },
      // createdAt: { type: "string" },
      // updatedAt: { type: "string" },
      // symbols: { type: "array" },
      data: literaldataschema,
      annotation: { type: "object" },
    },
    required: ["slug", "annotation", "data"],
    additionalProperties: false,
  };
}

function buildSubjectLiteralSchema(subject, annotationSchema, literalSchema) {
  return object.merge(literalSchema, {
    title: `${subject.name || subject.slug} Literal`,
    description: subject.description,
    properties: {
      annotation: annotationSchema,
    },
    additionalProperties: false,
  });
}
