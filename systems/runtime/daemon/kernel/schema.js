import { validators } from "@vivalence/shared";

/**
 * Builds JSON schemas for annotations and literals based on dimensions and subjects.
 * Schema hierarchy:
 *   - daemon.schema.annotation (base annotation schema)
 *   - daemon.schema.annotations[subject.slug] (per-subject annotation schemas)
 *   - daemon.schema.literal (base literal schema)
 *   - daemon.schema.literals[subject.slug] (per-subject literal schemas)
 */

// annotation: { lemma: "autobús", pos: "noun", gender: "masc", number: "sing" }

export async function schema(daemonDie) {
  // Initialize schema containers
  daemonDie.good.schema.annotation = baseAnnotationSchema();
  daemonDie.good.schema.annotations = {};
  daemonDie.good.schema.literal = baseLiteralSchema();
  daemonDie.good.schema.literals = {};

  // Load all dimensions for building the base annotation schema
  const dimensions = await daemonDie.good.entities.dimension.find({
    ancestor: null,
  });

  for (const dimension of dimensions) {
    await dimension.descendants.init();
    applyDimensionToBase(daemonDie.good.schema.annotation, dimension);
  }

  // Load all subjects and build per-subject schemas
  const subjects = await daemonDie.good.entities.subject.find({});

  for (const subject of subjects) {
    const annotationSchema = await buildSubjectAnnotationSchema(
      subject,
      daemonDie.good,
    );
    daemonDie.good.schema.annotations[subject.slug] = annotationSchema;

    const literalSchema = buildSubjectLiteralSchema(subject, annotationSchema);
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
  };

  for (const rule of subject.annotation || []) {
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

function baseLiteralSchema() {
  return {
    type: "object",
    title: "Literal",
    description: "Base literal schema",
    properties: {
      slug: { type: "string" },
      annotation: { type: "object" },
      data: { type: "object" },
    },
    required: ["slug", "annotation"],
    additionalProperties: true,
  };
}

function buildSubjectLiteralSchema(subject, annotationSchema) {
  return {
    type: "object",
    title: `${subject.name || subject.slug} Literal`,
    description: subject.description || "",
    properties: {
      slug: { type: "string" },
      annotation: annotationSchema,
      data: { type: "object" },
      traits: { type: "array", items: { type: "string" } },
    },
    required: ["slug", "annotation"],
    additionalProperties: true,
  };
}
